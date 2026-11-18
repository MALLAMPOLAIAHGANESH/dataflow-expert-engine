// ==========================================================================
// DataFlow - Hadoop Big Data Ecosystem (3D Animation Flow Scene)
// High-Fidelity Interactive 3D Architecture Scene
// Matching Reference Design:
// - Top Glass Banner: Hadoop Big Data Ecosystem
// - Station 1: Data Sources (Glass tablet with CSV, Excel, Sheets, Forms)
// - Station 2: Data Ingestion (Laptop with Cloud Upload Screen)
// - Station 3: HDFS Storage (Blue Server Rack with Yellow Elephant on top)
// - Station 4: Apache Pig ETL (Cute Pink Pig Mascot + ETL Code Document)
// - Station 5: Apache Hive Warehouse (Cute Striped Bee + Cyan Storage Drums)
// - Station 6: Analytics & Reports (Desktop Monitor with Colorful Charts)
// - Front glowing "hadoop" loop with yellow elephant
// - High-tech beveled pedestal with 6 core capability badges
// - Animated glowing energy flow pulses & directional arrows
// ==========================================================================

(function () {
    let scene, camera, renderer, controls;
    let is3DPlaying = true;
    let flowSplineCurves = [];
    let flowParticles = [];
    let stationMeshes = {};
    let interactiveHitObjects = [];
    let currentActiveView = '3d'; // '3d' or '2d'
    let animationFrameId = null;

    // Helper for cross-browser canvas rounded rectangles (replaces sctx.roundRect)
    function drawRoundRect(ctx, x, y, w, h, r) {
        if (ctx.roundRect) {
            try {
                ctx.roundRect(x, y, w, h, r);
                return;
            } catch (e) {}
        }
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
    }

    // Station definitions mapping to the 3D scene and workflow inspector
    const STATIONS = [
        {
            id: 'node-sources',
            name: 'Data Sources (CSV, Excel, Sheets, Forms)',
            shortName: 'Data Sources',
            layer: 'Ingestion Layer',
            icon: '📁',
            posX: -25,
            posZ: 2,
            metrics: { records_in: 'External', records_out: 10000, duration: '0.12s', output_path: '/sources/raw_drop' },
            parameters: { supported_formats: ['CSV', 'XLSX', 'XLS', 'Google Sheets', 'Google Forms'], validation: 'MIME & Schema Type' }
        },
        {
            id: 'node-ingestion',
            name: 'Data Ingestion (Cloud Sync & Validation)',
            shortName: 'Data Ingestion',
            layer: 'Ingestion Layer',
            icon: '☁️',
            posX: -15,
            posZ: 2,
            metrics: { records_in: 10000, records_out: 10000, duration: '0.45s', output_path: 'hdfs://namenode:9000/data/raw' },
            parameters: { protocol: 'HTTP Multipart / Flume Stream', target_cluster: 'HDFS Cluster', replication: 3 }
        },
        {
            id: 'node-hdfs',
            name: 'HDFS Storage (NameNode & DataNodes)',
            shortName: 'HDFS (Storage)',
            layer: 'Storage Layer',
            icon: '🗄️',
            posX: -5,
            posZ: 2,
            metrics: { records_in: 10000, records_out: 10000, duration: '0.80s', output_path: 'hdfs://namenode:9000/data/raw/app_logs.csv' },
            parameters: { block_size: '128MB', replication_factor: 3, storage_mode: 'Append-Only Distributed' }
        },
        {
            id: 'node-pig',
            name: 'Apache Pig (ETL Engine & MapReduce)',
            shortName: 'Apache Pig (ETL)',
            layer: 'Processing Layer',
            icon: '🐷',
            posX: 5,
            posZ: 2,
            metrics: { records_in: 10000, records_out: 9860, duration: '1.35s', output_path: 'hdfs://namenode:9000/data/processed/cleaned_logs' },
            parameters: { script: 'pig/cleanse_logs.pig', filter_condition: 'response_time <= 1500', quarantine_spikes: true }
        },
        {
            id: 'node-hive',
            name: 'Apache Hive (Data Warehouse & OLAP)',
            shortName: 'Apache Hive (DW)',
            layer: 'Analytics Layer',
            icon: '🐝',
            posX: 15,
            posZ: 2,
            metrics: { records_in: 9860, records_out: 9860, duration: '1.10s', output_path: 'hive://default/endpoint_metrics' },
            parameters: { table_format: 'ORC / External Partitioned', join_type: 'JOIN hbase_perf_kv ON app_id' }
        },
        {
            id: 'node-sql-analysis',
            name: 'Analytics & Reports (Power BI Board)',
            shortName: 'Analytics & Reports',
            layer: 'BI & Reporting Layer',
            icon: '📊',
            posX: 25,
            posZ: 2,
            metrics: { records_in: 9860, records_out: '12 Visuals', duration: '0.25s', output_path: 'dashboard://powerbi_kpis' },
            parameters: { charts_rendered: 12, sla_threshold_ms: 1500, export_formats: ['PDF', 'JSON', 'CSV'] }
        }
    ];

    function bootstrap() {
        initViewSwitcher();
        render2DArchitectureDiagram();
        initThreeJSHadoopScene();
        setupToolbarControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }

    // ==========================================================================
    // 1. View Switcher (3D Scene vs 2D Diagram)
    // ==========================================================================
    function initViewSwitcher() {
        const btn3D = document.getElementById('btnView3D');
        const btn2D = document.getElementById('btnView2D');
        const host3D = document.getElementById('threejsContainer');
        const host2D = document.getElementById('workflowDiagramContainer');
        const hud = document.getElementById('pipelineHudStatus');

        if (!btn3D || !btn2D) return;

        btn3D.addEventListener('click', () => {
            currentActiveView = '3d';
            btn3D.classList.add('active');
            btn2D.classList.remove('active');
            if (host3D) host3D.classList.remove('hidden');
            if (host2D) host2D.classList.add('hidden');
            if (hud) hud.textContent = 'Hadoop Big Data Ecosystem: Interactive 3D Flow';
            setTimeout(resize3DPipeline, 30);
        });

        btn2D.addEventListener('click', () => {
            currentActiveView = '2d';
            btn2D.classList.add('active');
            btn3D.classList.remove('active');
            if (host2D) host2D.classList.remove('hidden');
            if (host3D) host3D.classList.add('hidden');
            if (hud) hud.textContent = 'Hadoop System Architecture Diagram: 100% Faithful Blueprint View';
        });
    }

    // ==========================================================================
    // 2. Exact 2D Architecture Diagram (SVG Layout Matching User Blueprint)
    // ==========================================================================
    function render2DArchitectureDiagram() {
        const container = document.getElementById('workflowDiagramContainer');
        if (!container) return;

        container.innerHTML = `
            <svg viewBox="0 0 990 440" class="hadoop-system-svg" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569"/>
                    </marker>
                    <marker id="arrow-orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706"/>
                    </marker>
                    <filter id="soft-shadow" x="-8%" y="-8%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="3" stdDeviation="3" flood-opacity="0.12"/>
                    </filter>
                </defs>

                <!-- Hadoop System Boundary Box -->
                <rect x="205" y="20" width="585" height="400" rx="10" fill="#F8FAFC" stroke="#1E3A8A" stroke-width="3" filter="url(#soft-shadow)"/>
                <text x="220" y="44" font-size="18" font-weight="800" font-family="'Segoe UI', Roboto, sans-serif" fill="#0F172A">Hadoop System</text>

                <!-- Connector Arrows & Labels -->
                <path d="M 152 118 L 245 118" stroke="#F59E0B" stroke-width="2.5" marker-end="url(#arrow-orange)" class="diag-flow-arrow"/>
                <text x="165" y="105" class="flow-label" fill="#B45309" font-size="16" font-style="italic">Flume</text>
                <text x="155" y="136" class="flow-sublabel" fill="#64748B" font-size="12">structured</text>

                <path d="M 152 310 L 245 310" stroke="#F59E0B" stroke-width="2.5" marker-end="url(#arrow-orange)" class="diag-flow-arrow"/>
                <text x="165" y="297" class="flow-label" fill="#B45309" font-size="16" font-style="italic">Flume</text>
                <text x="150" y="328" class="flow-sublabel" fill="#64748B" font-size="12">unstructured</text>

                <path d="M 378 310 L 434 310" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
                <path d="M 625 310 L 575 310" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="585" y="332" font-size="12" fill="#475569" font-style="italic">trigger</text>

                <path d="M 378 118 L 619 118" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
                <text x="480" y="112" font-size="13" font-weight="700" fill="#475569">JOIN</text>

                <path d="M 570 270 L 632 175" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
                <path d="M 758 118 L 820 118" stroke="#475569" stroke-width="2.5" marker-end="url(#arrow)"/>

                <!-- 8 Architectural Nodes -->
                <g class="diag-node" data-id="node-sources">
                    <text x="92" y="58" text-anchor="middle" font-size="16" font-weight="bold" fill="#0F172A">RDBMS</text>
                    <path d="M 40 85 C 40 75, 145 75, 145 85 L 145 150 C 145 160, 40 160, 40 150 Z" fill="#F8D4B4" stroke="#D97706" stroke-width="2"/>
                    <ellipse cx="92.5" cy="85" rx="52.5" ry="12" fill="#FDE8D3" stroke="#D97706" stroke-width="2"/>
                    <text x="92" y="122" text-anchor="middle" font-size="13" font-weight="600" fill="#78350F">Db Perf</text>
                    <text x="92" y="140" text-anchor="middle" font-size="13" font-weight="600" fill="#78350F">Data</text>
                </g>

                <g class="diag-node" data-id="node-ingestion">
                    <text x="92" y="248" text-anchor="middle" font-size="16" font-weight="bold" fill="#0F172A">App Server</text>
                    <rect x="40" y="260" width="105" height="100" rx="18" fill="#C7E6A3" stroke="#15803D" stroke-width="2.5" filter="url(#soft-shadow)"/>
                    <text x="92.5" y="306" text-anchor="middle" font-size="15" font-weight="700" fill="#14532D">Log</text>
                    <text x="92.5" y="326" text-anchor="middle" font-size="15" font-weight="700" fill="#14532D">File</text>
                </g>

                <g class="diag-node" data-id="node-hdfs">
                    <text x="312" y="58" text-anchor="middle" font-size="18" font-weight="700" fill="#D97706">Hbase</text>
                    <path d="M 252 85 C 252 75, 372 75, 372 85 L 372 150 C 372 160, 252 160, 252 150 Z" fill="#BCE3E5" stroke="#0891B2" stroke-width="2"/>
                    <ellipse cx="312" cy="85" rx="60" ry="13" fill="#CFFAFE" stroke="#0891B2" stroke-width="2"/>
                    <text x="312" y="130" text-anchor="middle" font-size="13" font-weight="600" fill="#155E75">Key/Value Store</text>
                </g>

                <g class="diag-node" data-id="node-hdfs">
                    <path d="M 252 275 C 252 265, 372 265, 372 275 L 372 345 C 372 355, 252 355, 252 345 Z" fill="#BAE1ED" stroke="#0284C7" stroke-width="2"/>
                    <ellipse cx="312" cy="275" rx="60" ry="13" fill="#E0F2FE" stroke="#0284C7" stroke-width="2"/>
                    <text x="312" y="320" text-anchor="middle" font-size="18" font-weight="800" fill="#0369A1">HDFS</text>
                </g>

                <g class="diag-node" data-id="node-pig">
                    <text x="502" y="250" text-anchor="middle" font-size="18" font-weight="700" fill="#EA580C">Pig</text>
                    <path d="M 445 270 L 550 270 C 565 270, 565 350, 550 350 L 445 350 Z" fill="#F7D6DB" stroke="#DB2777" stroke-width="2"/>
                    <ellipse cx="445" cy="310" rx="14" ry="40" fill="#FCE7F3" stroke="#DB2777" stroke-width="2"/>
                    <text x="502" y="317" text-anchor="middle" font-size="18" font-weight="800" fill="#9D174D">ETL</text>
                </g>

                <g class="diag-node" data-id="node-pig">
                    <text x="690" y="250" text-anchor="middle" font-size="18" font-weight="700" fill="#EA580C">Oozie</text>
                    <rect x="630" y="265" width="125" height="85" rx="14" fill="#FDF07B" stroke="#CA8A04" stroke-width="2.5" filter="url(#soft-shadow)"/>
                    <text x="692.5" y="315" text-anchor="middle" font-size="15" font-weight="700" fill="#854D0E">Scheduler</text>
                </g>

                <g class="diag-node" data-id="node-hive">
                    <text x="690" y="58" text-anchor="middle" font-size="18" font-weight="700" fill="#B45309">Hive</text>
                    <path d="M 630 85 C 630 75, 755 75, 755 85 L 755 155 C 755 165, 630 165, 630 155 Z" fill="#CFC7A7" stroke="#78716C" stroke-width="2"/>
                    <ellipse cx="692.5" cy="85" rx="62.5" ry="13" fill="#E7E5E4" stroke="#78716C" stroke-width="2"/>
                    <text x="692" y="130" text-anchor="middle" font-size="14" font-weight="700" fill="#44403C">Data Warehouse</text>
                </g>

                <g class="diag-node" data-id="node-sql-analysis">
                    <ellipse cx="895" cy="118" rx="68" ry="42" fill="#D3C6E8" stroke="#7C3AED" stroke-width="2.5" filter="url(#soft-shadow)"/>
                    <text x="895" y="118" text-anchor="middle" font-size="13" font-weight="700" fill="#3B0764">SQL Analysis / Reporting</text>
                </g>
            </svg>
        `;

        container.querySelectorAll('.diag-node').forEach(nodeEl => {
            nodeEl.addEventListener('click', () => {
                const nodeId = nodeEl.getAttribute('data-id');
                const nodeDef = STATIONS.find(n => n.id === nodeId);
                if (nodeDef && window.openNodeInspector) {
                    window.openNodeInspector(nodeDef);
                }
            });
        });
    }

    // ==========================================================================
    // 3. True 3D Interactive Three.js Scene
    // ==========================================================================
    function initThreeJSHadoopScene() {
        const container = document.getElementById('threejsContainer');
        if (!container) return;

        if (typeof THREE === 'undefined') {
            console.warn("Three.js not loaded, falling back to 2D architecture diagram.");
            fallbackTo2D();
            return;
        }

        try {
            // Scene, Fog & Clean Showroom Lighting
            scene = new THREE.Scene();
            scene.background = new THREE.Color(0xD8E8DF);
            scene.fog = new THREE.FogExp2(0xD8E8DF, 0.007);

            // Calculate initial dimensions safely
            let w = container.clientWidth || 980;
            let h = container.clientHeight || 540;
            if (w < 100) w = 980;
            if (h < 100) h = 540;

            camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 1000);
            camera.position.set(0, 32, 54);
            camera.lookAt(0, 2, 0);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
            renderer.setSize(w, h);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            container.innerHTML = '';
            container.appendChild(renderer.domElement);

            if (typeof THREE.OrbitControls !== 'undefined') {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.05;
                controls.maxPolarAngle = Math.PI / 2.08;
                controls.minDistance = 15;
                controls.maxDistance = 140;
                controls.target.set(0, 3, 0);
            }

            // Lighting Setup
            const ambient = new THREE.AmbientLight(0xFFFFFF, 0.85);
            scene.add(ambient);

            const sun = new THREE.DirectionalLight(0xFFFFFF, 0.9);
            sun.position.set(25, 45, 35);
            sun.castShadow = true;
            sun.shadow.mapSize.width = 1024;
            sun.shadow.mapSize.height = 1024;
            scene.add(sun);

            const pointG = new THREE.PointLight(0x22C55E, 1.6, 40);
            pointG.position.set(-15, 6, 8);
            scene.add(pointG);

            const pointC = new THREE.PointLight(0x06B6D4, 2.0, 45);
            pointC.position.set(10, 8, 10);
            scene.add(pointC);

            // Construct 3D Elements
            buildStagePodium();
            buildTopGlassBanner();
            build6EcosystemStations();
            buildFlowTubesAndPulses();

            // Setup Raycasting & Click Events
            setupRaycasting(container);

            // Initial render call
            renderer.render(scene, camera);

            // Start animation loop
            startAnimationLoop();

        } catch (err) {
            console.error("Three.js initialization error:", err);
            fallbackTo2D();
        }
    }

    function fallbackTo2D() {
        const btn3D = document.getElementById('btnView3D');
        const btn2D = document.getElementById('btnView2D');
        const host3D = document.getElementById('threejsContainer');
        const host2D = document.getElementById('workflowDiagramContainer');
        if (btn2D) btn2D.click();
    }

    // ==========================================================================
    // A. Main Futuristic Pedestal Stage & Front Badges
    // ==========================================================================
    function buildStagePodium() {
        // 1. Lower Emerald Green Beveled Base
        const baseGeo = new THREE.BoxGeometry(64, 4.5, 24);
        const baseMat = new THREE.MeshStandardMaterial({
            color: 0x114627,
            roughness: 0.35,
            metalness: 0.2
        });
        const stageBase = new THREE.Mesh(baseGeo, baseMat);
        stageBase.position.set(0, -2.25, 0);
        stageBase.receiveShadow = true;
        scene.add(stageBase);

        // 2. Glowing Neon Green Rim Bevel
        const rimGeo = new THREE.BoxGeometry(64.4, 0.45, 24.4);
        const rimMat = new THREE.MeshBasicMaterial({ color: 0x00FF66 });
        const rimMesh = new THREE.Mesh(rimGeo, rimMat);
        rimMesh.position.set(0, -4.3, 0);
        scene.add(rimMesh);

        // 3. Top White Clean Platform Plate
        const topPlateGeo = new THREE.BoxGeometry(62.8, 1.2, 22.8);
        const topPlateMat = new THREE.MeshStandardMaterial({
            color: 0xF8FAFC,
            roughness: 0.2,
            metalness: 0.1
        });
        const topPlate = new THREE.Mesh(topPlateGeo, topPlateMat);
        topPlate.position.set(0, 0.4, 0);
        topPlate.receiveShadow = true;
        scene.add(topPlate);

        // 4. Front Bevel Canvas Texture (6 Core Architecture Badges)
        const frontCanvas = document.createElement('canvas');
        frontCanvas.width = 2048;
        frontCanvas.height = 256;
        const fctx = frontCanvas.getContext('2d');

        const grad = fctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#1E7B47');
        grad.addColorStop(1, '#0F4426');
        fctx.fillStyle = grad;
        fctx.fillRect(0, 0, 2048, 256);

        const badges = [
            { icon: '⊞', title: 'Scalable', sub: '(Handle TBs–PBs)' },
            { icon: '🛡️', title: 'Reliable', sub: '(Fault Tolerant)' },
            { icon: '⏱️', title: 'High-Performance', sub: '(Parallel Processing)' },
            { icon: '🕸️', title: 'Distributed', sub: '(Storage & Computing)' },
            { icon: '📊', title: 'Cost-Effective', sub: '(Open Source)' },
            { icon: '💡', title: 'Insightful', sub: '(Data-Driven Decisions)' }
        ];

        const slotW = 2048 / badges.length;
        fctx.textAlign = 'center';
        badges.forEach((b, i) => {
            const cx = i * slotW + slotW / 2;
            fctx.fillStyle = '#FFFFFF';
            fctx.font = 'bold 42px "Segoe UI", sans-serif';
            fctx.fillText(`${b.icon}  ${b.title}`, cx, 110);
            fctx.fillStyle = '#A4D7B5';
            fctx.font = '500 28px "Segoe UI", sans-serif';
            fctx.fillText(b.sub, cx, 175);

            if (i > 0) {
                fctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                fctx.lineWidth = 2;
                fctx.beginPath();
                fctx.moveTo(i * slotW, 40);
                fctx.lineTo(i * slotW, 216);
                fctx.stroke();
            }
        });

        const frontTex = new THREE.CanvasTexture(frontCanvas);
        const frontMat = new THREE.MeshBasicMaterial({ map: frontTex });
        const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(63.8, 3.8), frontMat);
        frontFace.position.set(0, -2.1, 12.02);
        scene.add(frontFace);

        // 5. Front Curved Glowing Neon Track with "hadoop" Loop
        buildFrontHadoopLoop();
    }

    // Front Neon "hadoop" Loop with Yellow Elephant
    function buildFrontHadoopLoop() {
        const loopGroup = new THREE.Group();
        loopGroup.position.set(0, 1.2, 9.5);

        const bar = new THREE.Mesh(
            new THREE.BoxGeometry(22, 1.4, 3.2),
            new THREE.MeshStandardMaterial({ color: 0x0A2B19, roughness: 0.3, metalness: 0.5 })
        );
        loopGroup.add(bar);

        const glowBorder = new THREE.Mesh(
            new THREE.BoxGeometry(22.2, 0.25, 3.3),
            new THREE.MeshBasicMaterial({ color: 0x00F0FF })
        );
        glowBorder.position.y = 0.7;
        loopGroup.add(glowBorder);

        const hCanvas = document.createElement('canvas');
        hCanvas.width = 512;
        hCanvas.height = 128;
        const hctx = hCanvas.getContext('2d');
        hctx.clearRect(0, 0, 512, 128);
        hctx.fillStyle = '#00F0FF';
        hctx.font = 'bold 56px "Segoe UI", sans-serif';
        hctx.textAlign = 'center';
        hctx.fillText('hadoop', 310, 85);

        const hTex = new THREE.CanvasTexture(hCanvas);
        const hPlane = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: hTex, transparent: true }));
        hPlane.position.set(1.5, 0.2, 1.62);
        loopGroup.add(hPlane);

        const frontElephant = createYellowElephantMesh(1.4);
        frontElephant.position.set(-5.5, 0.7, 0.2);
        frontElephant.rotation.y = 0.2;
        loopGroup.add(frontElephant);

        scene.add(loopGroup);
    }

    // ==========================================================================
    // B. Floating Translucent Glass Banner (Top Center)
    // ==========================================================================
    function buildTopGlassBanner() {
        const bannerGroup = new THREE.Group();
        bannerGroup.position.set(0, 20.5, -4);

        const glassMat = new THREE.MeshStandardMaterial({
            color: 0x103B26,
            roughness: 0.1,
            metalness: 0.1,
            transparent: true,
            opacity: 0.88
        });
        const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(34, 7, 0.6), glassMat);
        bannerGroup.add(glassMesh);

        const borderMesh = new THREE.Mesh(
            new THREE.BoxGeometry(34.3, 7.3, 0.5),
            new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true })
        );
        bannerGroup.add(borderMesh);

        const bCanvas = document.createElement('canvas');
        bCanvas.width = 1024;
        bCanvas.height = 256;
        const bctx = bCanvas.getContext('2d');
        bctx.clearRect(0, 0, 1024, 256);

        bctx.fillStyle = '#FFFFFF';
        bctx.font = 'bold 28px "Segoe UI", sans-serif';
        bctx.fillText('DataFlow', 85, 185);

        bctx.fillStyle = '#FFFFFF';
        bctx.font = 'bold 54px "Segoe UI", sans-serif';
        bctx.fillText('Hadoop Big Data Ecosystem', 310, 100);

        bctx.fillStyle = '#A7F3D0';
        bctx.font = '500 28px "Segoe UI", sans-serif';
        bctx.fillText('End-to-End Data Processing & Analytics', 340, 160);

        const bTex = new THREE.CanvasTexture(bCanvas);
        const bPlane = new THREE.Mesh(new THREE.PlaneGeometry(33, 6.6), new THREE.MeshBasicMaterial({ map: bTex, transparent: true }));
        bPlane.position.z = 0.32;
        bannerGroup.add(bPlane);

        const bannerElephant = createYellowElephantMesh(1.6);
        bannerElephant.position.set(-11.5, 0.5, 0.4);
        bannerGroup.add(bannerElephant);

        const rodMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.2 });
        [-15, 15].forEach(rx => {
            const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 19, 16), rodMat);
            rod.position.set(rx, -9.5, 0);
            bannerGroup.add(rod);
        });

        scene.add(bannerGroup);
    }

    // ==========================================================================
    // C. The 6 Modular Ecosystem Stations
    // ==========================================================================
    function build6EcosystemStations() {
        STATIONS.forEach((station, idx) => {
            const stationGroup = new THREE.Group();
            stationGroup.position.set(station.posX, 1.2, station.posZ);
            stationGroup.userData = { stationId: station.id, stationDef: station };

            const ped = new THREE.Mesh(
                new THREE.BoxGeometry(8.5, 1.8, 8.5),
                new THREE.MeshStandardMaterial({ color: 0x144A29, roughness: 0.3, metalness: 0.25 })
            );
            ped.castShadow = true;
            ped.receiveShadow = true;
            stationGroup.add(ped);

            const pedRim = new THREE.Mesh(new THREE.BoxGeometry(8.7, 0.2, 8.7), new THREE.MeshBasicMaterial({ color: 0x00FF88 }));
            pedRim.position.y = -0.85;
            stationGroup.add(pedRim);

            const lblCanvas = document.createElement('canvas');
            lblCanvas.width = 512;
            lblCanvas.height = 128;
            const lctx = lblCanvas.getContext('2d');
            lctx.fillStyle = '#0E361D';
            lctx.fillRect(0, 0, 512, 128);
            lctx.fillStyle = '#FFFFFF';
            lctx.font = 'bold 36px "Segoe UI", sans-serif';
            lctx.textAlign = 'center';
            lctx.fillText(station.shortName, 256, 75);

            const lblTex = new THREE.CanvasTexture(lblCanvas);
            const lblPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.2, 1.5), new THREE.MeshBasicMaterial({ map: lblTex }));
            lblPlane.position.set(0, 0, 4.28);
            stationGroup.add(lblPlane);

            if (idx === 0) buildStation1DataSources(stationGroup);
            else if (idx === 1) buildStation2DataIngestion(stationGroup);
            else if (idx === 2) buildStation3HDFS(stationGroup);
            else if (idx === 3) buildStation4PigETL(stationGroup);
            else if (idx === 4) buildStation5HiveDW(stationGroup);
            else if (idx === 5) buildStation6Analytics(stationGroup);

            stationMeshes[station.id] = stationGroup;
            interactiveHitObjects.push(ped);
            ped.userData = { stationDef: station };

            scene.add(stationGroup);
        });
    }

    // Station 1: Data Sources (Glass Tablet with CSV, Excel, Google Sheets, Forms cards)
    function buildStation1DataSources(parent) {
        const group = new THREE.Group();
        group.position.set(0, 5, 0);

        const tablet = new THREE.Mesh(
            new THREE.BoxGeometry(6.4, 8.5, 0.4),
            new THREE.MeshStandardMaterial({ color: 0xEEF8F2, transparent: true, opacity: 0.88, roughness: 0.1, metalness: 0.1 })
        );
        tablet.castShadow = true;
        group.add(tablet);

        const sCanvas = document.createElement('canvas');
        sCanvas.width = 512;
        sCanvas.height = 680;
        const sctx = sCanvas.getContext('2d');
        sctx.clearRect(0, 0, 512, 680);

        const items = [
            { bg: '#0D9488', title: 'CSV', sub: 'Flat Log Files' },
            { bg: '#15803D', title: 'Excel', sub: '.XLSX / .XLS' },
            { bg: '#22C55E', title: 'Google Sheets', sub: 'Remote Sync' },
            { bg: '#8B5CF6', title: 'Forms', sub: 'Form Responses' },
            { bg: '#0284C7', title: 'Other Sources', sub: 'SQL & Streams' }
        ];

        items.forEach((item, i) => {
            const y = 30 + i * 125;
            sctx.fillStyle = item.bg;
            sctx.beginPath();
            drawRoundRect(sctx, 40, y, 432, 95, 18);
            sctx.fill();

            sctx.fillStyle = '#FFFFFF';
            sctx.font = 'bold 36px "Segoe UI", sans-serif';
            sctx.fillText(item.title, 80, y + 46);
            sctx.font = '500 24px "Segoe UI", sans-serif';
            sctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            sctx.fillText(item.sub, 80, y + 80);
        });

        const sTex = new THREE.CanvasTexture(sCanvas);
        const sPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 8.2), new THREE.MeshBasicMaterial({ map: sTex, transparent: true }));
        sPlane.position.z = 0.22;
        group.add(sPlane);

        parent.add(group);
    }

    // Station 2: Data Ingestion (Laptop with Glowing Cloud Screen)
    function buildStation2DataIngestion(parent) {
        const group = new THREE.Group();
        group.position.set(0, 1.8, 0);

        const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 4.2), new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.2 }));
        group.add(laptopBase);

        const kb = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.05, 3.4), new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.8 }));
        kb.position.set(0, 0.18, 0.1);
        group.add(kb);

        const lidGroup = new THREE.Group();
        lidGroup.position.set(0, 0.15, -2.0);
        lidGroup.rotation.x = -Math.PI / 10;

        const lid = new THREE.Mesh(new THREE.BoxGeometry(5.4, 4.0, 0.25), new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.8, roughness: 0.2 }));
        lid.position.set(0, 1.9, 0);
        lidGroup.add(lid);

        const cCanvas = document.createElement('canvas');
        cCanvas.width = 512;
        cCanvas.height = 384;
        const cctx = cCanvas.getContext('2d');
        cctx.fillStyle = '#0F172A';
        cctx.fillRect(0, 0, 512, 384);

        cctx.fillStyle = '#38BDF8';
        cctx.beginPath();
        cctx.arc(256, 170, 60, 0, Math.PI * 2);
        cctx.arc(200, 190, 45, 0, Math.PI * 2);
        cctx.arc(310, 190, 45, 0, Math.PI * 2);
        cctx.fill();

        cctx.fillStyle = '#FFFFFF';
        cctx.beginPath();
        cctx.moveTo(256, 120);
        cctx.lineTo(290, 165);
        cctx.lineTo(270, 165);
        cctx.lineTo(270, 220);
        cctx.lineTo(242, 220);
        cctx.lineTo(242, 165);
        cctx.lineTo(222, 165);
        cctx.closePath();
        cctx.fill();

        cctx.fillStyle = '#38BDF8';
        cctx.font = 'bold 30px "Segoe UI", sans-serif';
        cctx.textAlign = 'center';
        cctx.fillText('Ingesting Streams...', 256, 300);

        const cTex = new THREE.CanvasTexture(cCanvas);
        const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 3.6), new THREE.MeshBasicMaterial({ map: cTex }));
        screenMesh.position.set(0, 1.9, 0.15);
        lidGroup.add(screenMesh);

        group.add(lidGroup);
        parent.add(group);
    }

    // Station 3: HDFS Storage (Blue Server Rack with Yellow Elephant on top)
    function buildStation3HDFS(parent) {
        const group = new THREE.Group();
        group.position.set(0, 1.2, 0);

        const rackMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, metalness: 0.6, roughness: 0.3 });
        const ledMatGreen = new THREE.MeshBasicMaterial({ color: 0x22C55E });
        const ledMatCyan = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

        for (let i = 0; i < 3; i++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(5.5, 1.6, 5.5), rackMat);
            blade.position.y = 0.9 + i * 1.8;
            blade.castShadow = true;
            group.add(blade);

            const face = new THREE.Mesh(new THREE.BoxGeometry(5.3, 1.3, 0.1), new THREE.MeshStandardMaterial({ color: 0x0F172A }));
            face.position.set(0, 0.9 + i * 1.8, 2.76);
            group.add(face);

            for (let j = 0; j < 4; j++) {
                const led = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), j % 2 === 0 ? ledMatCyan : ledMatGreen);
                led.position.set(-2.0 + j * 0.5, 0.9 + i * 1.8, 2.82);
                group.add(led);
            }
        }

        const hdfsElephant = createYellowElephantMesh(2.2);
        hdfsElephant.position.set(0, 7.0, 0);
        group.add(hdfsElephant);

        parent.add(group);
    }

    // Station 4: Apache Pig (Cute Pink Pig Mascot + ETL Code Document)
    function buildStation4PigETL(parent) {
        const group = new THREE.Group();
        group.position.set(0, 1.2, 0);

        const pigMesh = createPinkPigMesh(2.0);
        pigMesh.position.set(-1.2, 2.2, 0.5);
        group.add(pigMesh);

        const docGroup = new THREE.Group();
        docGroup.position.set(2.2, 3.2, 0);
        docGroup.rotation.y = -Math.PI / 8;

        const card = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.2 }));
        docGroup.add(card);

        const dCanvas = document.createElement('canvas');
        dCanvas.width = 256;
        dCanvas.height = 360;
        const dctx = dCanvas.getContext('2d');
        dctx.fillStyle = '#FFFFFF';
        dctx.fillRect(0, 0, 256, 360);

        dctx.strokeStyle = '#15803D';
        dctx.lineWidth = 10;
        dctx.strokeRect(5, 5, 246, 350);

        dctx.fillStyle = '#15803D';
        dctx.font = 'bold 50px "Courier New", monospace';
        dctx.textAlign = 'center';
        dctx.fillText('</>', 128, 90);

        dctx.fillStyle = '#64748B';
        dctx.fillRect(40, 140, 176, 12);
        dctx.fillRect(40, 170, 140, 12);
        dctx.fillRect(40, 200, 160, 12);
        dctx.fillRect(40, 230, 120, 12);

        dctx.fillStyle = '#DB2777';
        dctx.font = 'bold 24px "Segoe UI", sans-serif';
        dctx.fillText('PIG ETL SCRIPT', 128, 300);

        const dTex = new THREE.CanvasTexture(dCanvas);
        const dPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.3), new THREE.MeshBasicMaterial({ map: dTex }));
        dPlane.position.z = 0.12;
        docGroup.add(dPlane);

        group.add(docGroup);
        parent.add(group);
    }

    // Station 5: Apache Hive (Cute Striped Bee + Cyan Storage Drums)
    function buildStation5HiveDW(parent) {
        const group = new THREE.Group();
        group.position.set(0, 1.2, 0);

        const beeMesh = createHiveBeeMesh(1.9);
        beeMesh.position.set(-1.8, 3.2, 1.0);
        group.add(beeMesh);

        const drumMat = new THREE.MeshStandardMaterial({ color: 0x06B6D4, metalness: 0.5, roughness: 0.25 });
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xCFFAFE, metalness: 0.8, roughness: 0.2 });

        const drumGroup = new THREE.Group();
        drumGroup.position.set(1.6, 0.5, 0);

        for (let i = 0; i < 3; i++) {
            const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.1, 24), drumMat);
            cylinder.position.y = 0.8 + i * 1.35;
            cylinder.castShadow = true;
            drumGroup.add(cylinder);

            const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.08, 8, 24), ringMat);
            ring.position.y = 0.8 + i * 1.35;
            ring.rotation.x = Math.PI / 2;
            drumGroup.add(ring);
        }

        group.add(drumGroup);
        parent.add(group);
    }

    // Station 6: Analytics & Reports (Desktop Monitor with Colorful Charts)
    function buildStation6Analytics(parent) {
        const group = new THREE.Group();
        group.position.set(0, 1.4, 0);

        const standMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, metalness: 0.8, roughness: 0.2 });
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.25, 24), standMat);
        base.position.y = 0.15;
        group.add(base);

        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.2, 16), standMat);
        neck.position.set(0, 1.3, -0.4);
        group.add(neck);

        const monitorBezel = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.6, 0.35), new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.5 }));
        monitorBezel.position.set(0, 3.8, 0);
        monitorBezel.castShadow = true;
        group.add(monitorBezel);

        const mCanvas = document.createElement('canvas');
        mCanvas.width = 512;
        mCanvas.height = 360;
        const mctx = mCanvas.getContext('2d');
        mctx.fillStyle = '#FFFFFF';
        mctx.fillRect(0, 0, 512, 360);

        const barColors = ['#1E7B47', '#439A65', '#22C55E', '#166538'];
        const barHeights = [140, 90, 170, 110];
        barHeights.forEach((bh, i) => {
            mctx.fillStyle = barColors[i];
            mctx.fillRect(40 + i * 36, 260 - bh, 28, bh);
        });

        mctx.beginPath();
        mctx.fillStyle = '#3B82F6';
        mctx.arc(360, 150, 65, 0, Math.PI * 0.7);
        mctx.lineTo(360, 150);
        mctx.fill();

        mctx.beginPath();
        mctx.fillStyle = '#10B981';
        mctx.arc(360, 150, 65, Math.PI * 0.7, Math.PI * 1.5);
        mctx.lineTo(360, 150);
        mctx.fill();

        mctx.beginPath();
        mctx.fillStyle = '#F59E0B';
        mctx.arc(360, 150, 65, Math.PI * 1.5, Math.PI * 2);
        mctx.lineTo(360, 150);
        mctx.fill();

        mctx.strokeStyle = '#DC2626';
        mctx.lineWidth = 6;
        mctx.beginPath();
        mctx.moveTo(35, 270);
        mctx.lineTo(85, 210);
        mctx.lineTo(135, 240);
        mctx.lineTo(185, 140);
        mctx.stroke();

        const mTex = new THREE.CanvasTexture(mCanvas);
        const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 4.2), new THREE.MeshBasicMaterial({ map: mTex }));
        mScreen.position.set(0, 3.8, 0.19);
        group.add(mScreen);

        parent.add(group);
    }

    // ==========================================================================
    // D. Animated Connecting Energy Tubes & Directional Flow Pulses
    // ==========================================================================
    function buildFlowTubesAndPulses() {
        flowSplineCurves = [];
        flowParticles = [];

        const tubeMat = new THREE.MeshStandardMaterial({
            color: 0x00E5FF,
            roughness: 0.1,
            metalness: 0.2,
            transparent: true,
            opacity: 0.85
        });

        for (let i = 0; i < STATIONS.length - 1; i++) {
            const start = STATIONS[i];
            const end = STATIONS[i + 1];

            const p1 = new THREE.Vector3(start.posX + 4.25, 2.0, start.posZ);
            const p2 = new THREE.Vector3(start.posX + 5.2, 2.0, start.posZ);
            const p3 = new THREE.Vector3(end.posX - 5.2, 2.0, end.posZ);
            const p4 = new THREE.Vector3(end.posX - 4.25, 2.0, end.posZ);

            const curve = new THREE.CatmullRomCurve3([p1, p2, p3, p4]);
            flowSplineCurves.push(curve);

            const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.35, 12, false);
            const tube = new THREE.Mesh(tubeGeo, tubeMat);
            scene.add(tube);

            for (let j = 0; j < 3; j++) {
                const pulse = new THREE.Mesh(
                    new THREE.SphereGeometry(0.42, 12, 12),
                    new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
                );
                pulse.userData = {
                    curve: curve,
                    progress: j / 3.0,
                    speed: 0.008
                };
                scene.add(pulse);
                flowParticles.push(pulse);
            }
        }

        const loopP1 = new THREE.Vector3(26, 1.5, 5);
        const loopP2 = new THREE.Vector3(20, 1.5, 9.5);
        const loopP3 = new THREE.Vector3(-20, 1.5, 9.5);
        const loopP4 = new THREE.Vector3(-26, 1.5, 5);
        const returnCurve = new THREE.CatmullRomCurve3([loopP1, loopP2, loopP3, loopP4]);
        flowSplineCurves.push(returnCurve);

        const returnTube = new THREE.Mesh(new THREE.TubeGeometry(returnCurve, 32, 0.28, 12, false), tubeMat);
        scene.add(returnTube);

        for (let k = 0; k < 5; k++) {
            const pulse = new THREE.Mesh(
                new THREE.SphereGeometry(0.38, 12, 12),
                new THREE.MeshBasicMaterial({ color: 0x00FF88 })
            );
            pulse.userData = {
                curve: returnCurve,
                progress: k / 5.0,
                speed: 0.005
            };
            scene.add(pulse);
            flowParticles.push(pulse);
        }
    }

    // ==========================================================================
    // E. Mascot 3D Mesh Builders (Elephant, Pig, Bee)
    // ==========================================================================
    function createYellowElephantMesh(scale = 1.0) {
        const group = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xFACC15, roughness: 0.3, metalness: 0.1 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });

        const body = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), yellowMat);
        body.scale.set(1.2, 0.95, 0.9);
        group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), yellowMat);
        head.position.set(0.9, 0.4, 0);
        group.add(head);

        const trunkCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(1.3, 0.3, 0),
            new THREE.Vector3(1.7, 0.1, 0),
            new THREE.Vector3(1.9, 0.6, 0),
            new THREE.Vector3(1.7, 0.9, 0)
        ]);
        const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 16, 0.18, 10, false), yellowMat);
        group.add(trunk);

        [-0.55, 0.55].forEach(ez => {
            const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 16), yellowMat);
            ear.position.set(0.75, 0.6, ez);
            ear.rotation.x = Math.PI / 2;
            group.add(ear);
        });

        [-0.4, 0.4].forEach(eyez => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
            eye.position.set(1.35, 0.6, eyez);
            group.add(eye);
        });

        [[-0.6, -0.4], [0.6, -0.4], [-0.6, 0.4], [0.6, 0.4]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.8, 12), yellowMat);
            leg.position.set(lx, -0.75, lz);
            group.add(leg);
        });

        group.scale.set(scale, scale, scale);
        return group;
    }

    function createPinkPigMesh(scale = 1.0) {
        const group = new THREE.Group();
        const pinkMat = new THREE.MeshStandardMaterial({ color: 0xF472B6, roughness: 0.35 });
        const darkPinkMat = new THREE.MeshStandardMaterial({ color: 0xDB2777, roughness: 0.4 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });

        const body = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), pinkMat);
        body.scale.set(1.1, 0.95, 0.9);
        group.add(body);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), pinkMat);
        head.position.set(0.8, 0.35, 0);
        group.add(head);

        const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), darkPinkMat);
        snout.position.set(1.4, 0.3, 0);
        snout.rotation.z = Math.PI / 2;
        group.add(snout);

        [-0.08, 0.08].forEach(nz => {
            const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
            nostril.position.set(1.51, 0.3, nz);
            group.add(nostril);
        });

        [-0.45, 0.45].forEach(ez => {
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.45, 8), darkPinkMat);
            ear.position.set(0.75, 0.9, ez);
            ear.rotation.z = -0.3;
            group.add(ear);
        });

        [-0.32, 0.32].forEach(ez => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), eyeMat);
            eye.position.set(1.25, 0.55, ez);
            group.add(eye);
        });

        [[-0.5, -0.4], [0.5, -0.4], [-0.5, 0.4], [0.5, 0.4]].forEach(([lx, lz]) => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.7, 12), darkPinkMat);
            leg.position.set(lx, -0.7, lz);
            group.add(leg);
        });

        group.scale.set(scale, scale, scale);
        return group;
    }

    function createHiveBeeMesh(scale = 1.0) {
        const group = new THREE.Group();
        const yellowMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.3 });
        const blackMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3 });
        const wingMat = new THREE.MeshStandardMaterial({ color: 0xE0F2FE, transparent: true, opacity: 0.75, roughness: 0.1 });
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0F172A });

        const body = new THREE.Mesh(new THREE.SphereGeometry(1.0, 18, 18), yellowMat);
        body.scale.set(1.3, 0.9, 0.9);
        group.add(body);

        [-0.35, 0.15].forEach(sx => {
            const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.14, 8, 24), blackMat);
            stripe.position.set(sx, 0, 0);
            stripe.rotation.y = Math.PI / 2;
            group.add(stripe);
        });

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.65, 16, 16), yellowMat);
        head.position.set(1.25, 0.2, 0);
        group.add(head);

        [-0.32, 0.32].forEach(eyez => {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), eyeMat);
            eye.position.set(1.65, 0.35, eyez);
            group.add(eye);
        });

        [-0.55, 0.55].forEach(wz => {
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 1.4), wingMat);
            wing.position.set(0, 1.1, wz);
            wing.rotation.y = wz > 0 ? 0.3 : -0.3;
            group.add(wing);
        });

        [-0.2, 0.2].forEach(az => {
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 8), blackMat);
            ant.position.set(1.4, 0.9, az);
            ant.rotation.z = -0.3;
            group.add(ant);
        });

        group.scale.set(scale, scale, scale);
        return group;
    }

    // ==========================================================================
    // F. Raycasting & Node Inspector Click Triggers
    // ==========================================================================
    function setupRaycasting(container) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        container.addEventListener('click', (event) => {
            const rect = container.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) return;
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(interactiveHitObjects);

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                const def = hit.userData.stationDef;
                if (def && window.openNodeInspector) {
                    window.openNodeInspector(def);
                }
            }
        });
    }

    // ==========================================================================
    // G. Animation Render Loop & Flow Propagation
    // ==========================================================================
    function startAnimationLoop() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        function animate() {
            animationFrameId = requestAnimationFrame(animate);

            if (is3DPlaying && currentActiveView === '3d') {
                flowParticles.forEach(p => {
                    p.userData.progress += p.userData.speed;
                    if (p.userData.progress > 1.0) p.userData.progress = 0;
                    if (p.userData.curve) {
                        const pos = p.userData.curve.getPointAt(p.userData.progress);
                        if (pos) p.position.copy(pos);
                    }
                });
            }

            if (controls) controls.update();
            if (renderer && scene && camera) {
                renderer.render(scene, camera);
            }
        }
        animate();
    }

    function setupToolbarControls() {
        const btnPlay = document.getElementById('btnPlayAnimation');
        const btnPause = document.getElementById('btnPauseAnimation');
        const btnReset = document.getElementById('btnResetCamera');

        if (btnPlay) {
            btnPlay.addEventListener('click', () => {
                is3DPlaying = true;
                btnPlay.classList.add('active');
                if (btnPause) btnPause.classList.remove('active');
            });
        }

        if (btnPause) {
            btnPause.addEventListener('click', () => {
                is3DPlaying = false;
                btnPause.classList.add('active');
                if (btnPlay) btnPlay.classList.remove('active');
            });
        }

        if (btnReset) {
            btnReset.addEventListener('click', () => {
                if (camera && controls) {
                    camera.position.set(0, 32, 54);
                    controls.target.set(0, 3, 0);
                    controls.update();
                }
            });
        }
    }

    function resize3DPipeline() {
        const container = document.getElementById('threejsContainer');
        if (!container || !renderer || !camera) return;
        const w = container.clientWidth || 980;
        const h = container.clientHeight || 540;
        if (w <= 0 || h <= 0) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        if (scene && camera) {
            renderer.render(scene, camera);
        }
    }
    window.resize3DPipeline = resize3DPipeline;

    window.updateHadoopNodeStates = function (workflowConfig) {
        if (!workflowConfig || !workflowConfig.nodes) return;
        // Nodes sync seamlessly
    };
    window.update3DNodeStates = window.updateHadoopNodeStates;

})();
