// Metro Hyper-Loop 3D Engine - Premium Login Experience

class MetroHyperLoop {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.train = null;
        this.building = null;
        this.sonicBooms = [];
        this.lightTrails = [];
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        this.trainAngle = 0;
        
        this.loadThreeJS().then(() => {
            this.init();
            this.animate();
            this.setupInteraction();
        });
    }

    async loadThreeJS() {
        // Load Three.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
        
        return new Promise((resolve) => {
            script.onload = () => {
                this.THREE = window.THREE;
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    init() {
        const THREE = this.THREE;
        
        // Scene Setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 10, 100);

        // Camera Setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer Setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        // Append to canvas container
        const container = document.getElementById('hyper-loop-canvas');
        if (container) {
            container.appendChild(this.renderer.domElement);
        }

        // Create Scene Elements
        this.createEnvironment();
        this.createMetroBuilding();
        this.createOrbitingTrain();
        this.createLighting();
        this.createNeonGrid();

        // Handle Resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createEnvironment() {
        const THREE = this.THREE;
        
        // Ambient base lighting
        const ambientLight = new THREE.AmbientLight(0x001122, 0.3);
        this.scene.add(ambientLight);

        // Neon grid floor
        const gridGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const gridMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const gridFloor = new THREE.Mesh(gridGeometry, gridMaterial);
        gridFloor.rotation.x = -Math.PI / 2;
        gridFloor.position.y = -5;
        this.scene.add(gridFloor);
    }

    createMetroBuilding() {
        const THREE = this.THREE;
        // Central hub building - Obsidian glass structure
        const buildingGroup = new THREE.Group();

        // Main structure
        const mainGeometry = new THREE.CylinderGeometry(8, 8, 15, 8);
        const mainMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x111122,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.6,
            thickness: 0.5,
            transparent: true,
            opacity: 0.3,
            envMapIntensity: 1
        });
        const mainBuilding = new THREE.Mesh(mainGeometry, mainMaterial);
        mainBuilding.position.y = 2.5;
        buildingGroup.add(mainBuilding);

        // Glass panels
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const panelGeometry = new THREE.BoxGeometry(1, 12, 0.1);
            const panelMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x00f2ff,
                metalness: 0.8,
                roughness: 0,
                transmission: 0.8,
                transparent: true,
                opacity: 0.2,
                emissive: 0x00f2ff,
                emissiveIntensity: 0.2
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            panel.position.x = Math.cos(angle) * 7.5;
            panel.position.z = Math.sin(angle) * 7.5;
            panel.position.y = 2.5;
            panel.rotation.y = angle;
            buildingGroup.add(panel);
        }

        // Top ring
        const ringGeometry = new THREE.TorusGeometry(8, 0.3, 8, 32);
        const ringMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffd700,
            metalness: 1,
            roughness: 0,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const topRing = new THREE.Mesh(ringGeometry, ringMaterial);
        topRing.position.y = 7.5;
        buildingGroup.add(topRing);

        this.building = buildingGroup;
        this.scene.add(buildingGroup);
    }

    createOrbitingTrain() {
        const THREE = this.THREE;
        // Sleek metro train
        const trainGroup = new THREE.Group();

        // Main body
        const bodyGeometry = new THREE.CapsuleGeometry(0.8, 8, 4, 16);
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a2e,
            metalness: 1,
            roughness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        trainGroup.add(body);

        // Windows
        for (let i = 0; i < 6; i++) {
            const windowGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.1);
            const windowMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x00f2ff,
                metalness: 0.9,
                roughness: 0,
                transmission: 0.9,
                emissive: 0x00f2ff,
                emissiveIntensity: 0.5
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.x = (i - 2.5) * 1.3;
            window.position.y = 0.5;
            trainGroup.add(window);
        }

        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const headlightMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 2
        });
        const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight1.position.set(4.5, 0, 0);
        trainGroup.add(headlight1);
        const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight2.position.set(4.5, 0, 0);
        trainGroup.add(headlight2);

        this.train = trainGroup;
        this.scene.add(trainGroup);
    }

    createLighting() {
        const THREE = this.THREE;
        // Dynamic point lights following train
        this.trainLight = new THREE.PointLight(0x00f2ff, 2, 20);
        this.trainLight.position.set(0, 0, 0);
        this.scene.add(this.trainLight);

        // Station lights
        const stationLight1 = new THREE.PointLight(0xffd700, 1, 15);
        stationLight1.position.set(10, 10, 10);
        this.scene.add(stationLight1);

        const stationLight2 = new THREE.PointLight(0xffd700, 1, 15);
        stationLight2.position.set(-10, 10, -10);
        this.scene.add(stationLight2);

        // Spotlights on train
        this.trainSpotlight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6, 0.5);
        this.trainSpotlight.position.set(0, 0, 0);
        this.scene.add(this.trainSpotlight);
    }

    createNeonGrid() {
        const THREE = this.THREE;
        // Create neon light trails
        const trailCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(10, 0, 0),
            new THREE.Vector3(0, 0, 10),
            new THREE.Vector3(-10, 0, 0),
            new THREE.Vector3(0, 0, -10),
            new THREE.Vector3(10, 0, 0)
        ]);

        const trailGeometry = new THREE.TubeGeometry(trailCurve, 64, 0.1, 8, false);
        const trailMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00f2ff,
            metalness: 1,
            roughness: 0,
            emissive: 0x00f2ff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.6
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        this.scene.add(trail);
    }

    createSonicBoom() {
        const THREE = this.THREE;
        // Create expanding torus for sonic boom effect
        const boomGeometry = new THREE.TorusGeometry(1, 0.2, 8, 32);
        const boomMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00f2ff,
            metalness: 1,
            roughness: 0,
            emissive: 0x00f2ff,
            emissiveIntensity: 1,
            transparent: true,
            opacity: 1
        });
        const boom = new THREE.Mesh(boomGeometry, boomMaterial);
        
        // Position at train location
        const trainPos = this.train.position;
        boom.position.copy(trainPos);
        boom.position.y = 0;
        
        this.scene.add(boom);
        this.sonicBooms.push({
            mesh: boom,
            scale: 1,
            opacity: 1
        });
    }

    setupInteraction() {
        // Mouse parallax effect
        document.addEventListener('mousemove', (event) => {
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.time += 0.016; // 60fps
        
        // Animate train in circular orbit
        this.trainAngle += 0.02;
        const radius = 10;
        this.train.position.x = Math.cos(this.trainAngle) * radius;
        this.train.position.z = Math.sin(this.trainAngle) * radius;
        this.train.position.y = Math.sin(this.time * 2) * 0.5;
        this.train.rotation.y = this.trainAngle + Math.PI / 2;
        
        // Update train lights
        if (this.trainLight) {
            this.trainLight.position.copy(this.train.position);
        }
        if (this.trainSpotlight) {
            this.trainSpotlight.position.copy(this.train.position);
            this.trainSpotlight.target.position.set(
                Math.cos(this.trainAngle + 0.1) * radius,
                0,
                Math.sin(this.trainAngle + 0.1) * radius
            );
        }
        
        // Create sonic booms every second
        if (Math.floor(this.time) % 1 === 0 && this.time % 1 < 0.016) {
            this.createSonicBoom();
            
            // Pulse ambient light
            const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight);
            if (ambientLight) {
                ambientLight.intensity = 0.5;
            }
        }
        
        // Fade ambient light back
        const ambientLight = this.scene.children.find(child => child instanceof THREE.AmbientLight);
        if (ambientLight && ambientLight.intensity > 0.3) {
            ambientLight.intensity -= 0.01;
        }
        
        // Animate sonic booms
        this.sonicBooms = this.sonicBooms.filter(boom => {
            boom.scale += 0.1;
            boom.opacity -= 0.02;
            
            boom.mesh.scale.setScalar(boom.scale);
            boom.mesh.material.opacity = boom.opacity;
            
            if (boom.opacity <= 0) {
                this.scene.remove(boom.mesh);
                return false;
            }
            return true;
        });
        
        // Rotate building slowly
        if (this.building) {
            this.building.rotation.y += 0.002;
        }
        
        // Mouse parallax
        if (this.building) {
            this.building.rotation.x = this.mouse.y * 0.05;
            this.building.rotation.z = this.mouse.x * 0.05;
        }
        
        // Cinematic camera movement
        this.camera.position.x = Math.sin(this.time * 0.1) * 2;
        this.camera.position.y = 5 + Math.sin(this.time * 0.2) * 1;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MetroHyperLoop();
});

// Export for potential external access
window.MetroHyperLoop = MetroHyperLoop;
