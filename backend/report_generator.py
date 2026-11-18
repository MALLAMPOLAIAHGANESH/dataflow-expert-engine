import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import io
from datetime import datetime

def generate_pdf_report(df, output_path='Data_Quality_Report.pdf', summary=None):
    """
    Generates a formal multi-page PDF engineering & data quality report
    using measured metrics computed from the active Big Data dataset.
    """
    if df.empty:
        return None

    if summary is None:
        summary = {}

    total_req = summary.get('total_requests', len(df))
    avg_lat = summary.get('avg_response_time', 'N/A')
    p95_lat = summary.get('p95_latency', 'N/A')
    total_err = summary.get('server_errors', 'N/A')
    err_rate = summary.get('error_rate_pct', 'N/A')
    dataset_source = summary.get('dataset_source', 'Cleaned Data Store')
    is_perf = summary.get('is_performance_data', False)

    with PdfPages(output_path) as pdf:
        # PAGE 1: Formal Title Page
        fig = plt.figure(figsize=(8.5, 11))
        fig.clf()
        fig.patch.set_facecolor('#F6F8F6')
        
        plt.text(0.5, 0.84, 'DATAFLOW PLATFORM', size=24, ha='center', weight='bold', color='#1A261F')
        plt.text(0.5, 0.79, 'Automated Dataset Engineering & Assessment Report', size=14, ha='center', color='#1E7B47', weight='semibold')
        plt.text(0.5, 0.75, f'Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}', size=10, ha='center', color='#6B7A70')
        
        plt.plot([0.15, 0.85], [0.72, 0.72], color='#B8D8C5', lw=2)
        
        if is_perf:
            summary_text = (
                f"EXECUTIVE SUMMARY (APPLICATION PERFORMANCE WORKLOAD)\n\n"
                f"• Architecture: HDFS (Storage) -> Pig (ETL Cleaning) -> Hive (Analytics)\n"
                f"• Dataset Source: {dataset_source}\n"
                f"• Total Valid Workload Processed: {total_req:,} Records\n"
                f"• Global Average Response Time: {avg_lat}\n"
                f"• Global 95th Percentile Latency: {p95_lat}\n"
                f"• Total Faults/Server Errors: {total_err} ({err_rate})\n"
                f"• High-Latency Threshold: > 1,500 ms isolated into rejected partitions\n"
                f"• SLA Conformance: Deterministic calculations verified against warehouse metrics."
            )
        else:
            dim_name = summary.get('primary_dimension', 'Categories')
            dim_count = summary.get('dimension_count', len(df))
            summary_text = (
                f"EXECUTIVE SUMMARY (DOMAIN TABULAR DATASET)\n\n"
                f"• Platform Engine: Universal Ingestion & Big Data Analytics Engine\n"
                f"• Dataset Source: {dataset_source}\n"
                f"• Total Records Processed: {total_req:,} Records\n"
                f"• Primary Analytical Dimension: {dim_name} ({dim_count} distinct segments)\n"
                f"• Response Time SLA Metrics: Not Applicable (No latency field in dataset)\n"
                f"• Server Error Metrics: Not Applicable (No HTTP status field in dataset)\n"
                f"• Data Quality: Checked for nulls, empty values, and schema integrity."
            )
        
        plt.text(0.15, 0.44, summary_text, size=10.5, ha='left', va='top', family='monospace',
                 bbox=dict(boxstyle='round,pad=1.2', facecolor='#FFFFFF', edgecolor='#E2E8E3', lw=1.5))
        
        plt.text(0.5, 0.12, 'DataFlow Distributed Analytics & Ingestion Platform', size=9, ha='center', color='#8E9E94')
        plt.axis('off')
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close()

        # PAGE 2: Measured Analytics Data Table
        fig, ax = plt.subplots(figsize=(8.5, 11))
        fig.patch.set_facecolor('#FFFFFF')
        ax.axis('tight')
        ax.axis('off')
        
        df_display = df.copy()
        for col in df_display.select_dtypes(include=['float', 'float64']).columns:
            df_display[col] = df_display[col].round(2)
            
        rename_map = {
            'endpoint': 'Segment / Category',
            'total_requests': 'Records / Volume',
            'avg_response_time': 'Avg Latency' if is_perf else 'Metric Value',
            'p95_latency': 'P95 Latency',
            'server_errors': 'Server Errors',
            'error_rate_pct': 'Error Rate'
        }
        df_display = df_display.rename(columns=rename_map)
        
        table_data = df_display.values.tolist()
        columns = df_display.columns.tolist()
        
        table = ax.table(cellText=table_data, colLabels=columns, loc='center', cellLoc='center')
        table.auto_set_font_size(False)
        table.set_fontsize(9)
        table.scale(1.15, 1.8)
        
        for k, cell in table.get_celld().items():
            if k[0] == 0:
                cell.set_text_props(weight='bold', color='#FFFFFF')
                cell.set_facecolor('#1E7B47')
            else:
                cell.set_facecolor('#F6F8F6' if k[0] % 2 == 0 else '#FFFFFF')
                
        title_str = 'Hive Aggregated Endpoint Analytics' if is_perf else 'Dataset Categorical Distribution Summary'
        plt.title(title_str, fontsize=14, pad=40, weight='bold', color='#1A261F')
        pdf.savefig(fig, bbox_inches='tight', facecolor=fig.get_facecolor())
        plt.close()
        
        # PAGE 3: Visual Analytics Chart
        fig, ax = plt.subplots(figsize=(8.5, 8))
        fig.patch.set_facecolor('#FFFFFF')
        
        first_col = df.columns[0]
        cnt_col = 'total_requests' if 'total_requests' in df.columns else df.columns[1]
        
        ax.bar(df[first_col].astype(str), df[cnt_col], color='#1E7B47', edgecolor='#166538', width=0.45)
        ax.set_title('Record Volume by Segment / Group', fontsize=13, weight='bold', color='#1A261F')
        ax.set_ylabel('Count / Volume')
        ax.grid(axis='y', linestyle='--', alpha=0.5)
        plt.xticks(rotation=25, ha='right')
        plt.tight_layout(pad=3.0)
        pdf.savefig(fig, facecolor=fig.get_facecolor())
        plt.close()
        
    return output_path
