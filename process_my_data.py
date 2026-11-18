import os
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px

# 1. DIRECTORY SETUP
# Point this to the folder containing your real CSV/Excel datasets
directory_path = 'data_folder' 

print(f"Scanning directory: {directory_path}...")
all_files = [f for f in os.listdir(directory_path) if f.endswith('.csv')]

df_list = []
for file in all_files:
    filepath = os.path.join(directory_path, file)
    print(f"Loading {file}...")
    temp_df = pd.read_csv(filepath)
    df_list.append(temp_df)
    
if df_list:
    # Combine all individual CSV files into one master DataFrame
    master_df = pd.concat(df_list, ignore_index=True)
    
    # 2. KPI CALCULATIONS
    # Note: Update 'Sales' and 'Profit' to match the exact column headers in your CSV
    total_sales = master_df['Sales'].sum()
    total_profit = master_df['Profit'].sum()
    
    # Calculate overall profit margin
    if total_sales > 0:
        profit_margin = (total_profit / total_sales) * 100
    else:
        profit_margin = 0

    # 3. GENERATE POWER-BI STYLE KPI CARDS
    fig_kpi = go.Figure()
    
    # Total Sales Indicator
    fig_kpi.add_trace(go.Indicator(
        mode="number", 
        value=total_sales, 
        title={"text": "Total Sales (₹)"}, 
        domain={'row': 0, 'column': 0}
    ))
    
    # Total Profit Indicator
    fig_kpi.add_trace(go.Indicator(
        mode="number", 
        value=total_profit, 
        title={"text": "Total Profit (₹)"}, 
        domain={'row': 0, 'column': 1}
    ))
    
    # Profit Margin Indicator
    fig_kpi.add_trace(go.Indicator(
        mode="number", 
        value=profit_margin, 
        title={"text": "Margin %"}, 
        number={'suffix': "%", 'valueformat': '.1f'}, 
        domain={'row': 0, 'column': 2}
    ))
    
    fig_kpi.update_layout(grid={'rows': 1, 'columns': 3, 'pattern': "independent"}, height=250)

    # 4. EXPORT TO INTERACTIVE HTML
    output_filename = "My_Custom_Dashboard.html"
    fig_kpi.write_html(output_filename)
    print(f"Dashboard generated successfully! Open {output_filename} in your browser.")
    
else:
    print(f"No CSV files found in the directory: '{directory_path}'. Please check the folder path.")