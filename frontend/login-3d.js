// Metro Hyper-Loop 3D Engine - Premium Login Experience
class MetroHyperLoop {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.train = null;
        this.metroHub = null;
        this.pulseRings = [];
        this.lightTrails = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.trainSpeed = 0.02;
        this.pulseTimer = 0;
        
        this.init();
    }

    init() {
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
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Append to container
        const container = document.getElementById('hyper-loop-container');
        container.appendChild(this.renderer.domElement);
        
        // Create Scene Elements
        this.createMetroHub();
        this.createTrain();
        this.createLighting();
        this.createEnvironment();
        
        // Event Listeners
        this.setupEventListeners();
        
        // Start Animation Loop
        this.animate();
    }

    createMetroHub() {
        // Glass Structure - CMRL HQ
        const hubGeometry = new THREE.BoxGeometry(8, 6, 4);
        const hubMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x00f2ff,
            metalness: 0.2,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true,
            opacity: 0.3,
            envMapIntensity: 1
        });
        
        this.metroHub = new THREE.Mesh(hubGeometry, hubMaterial);
        this.metroHub.position.set(0, 0, 0);
        this.metroHub.castShadow = true;
        this.metroHub.receiveShadow = true;
        this.scene.add(this.metroHub);
        
        // Inner Glow
        const glowGeometry = new THREE.BoxGeometry(7.5, 5.5, 3.5);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.1
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.metroHub.add(glow);
        
        // Neon Frame
        const frameEdges = new THREE.EdgesGeometry(hubGeometry);
        const frameMaterial = new THREE.LineBasicMaterial({
            color: 0x00f2ff,
            linewidth: 2
        });
        const frame = new THREE.LineSegments(frameEdges, frameMaterial);
        this.metroHub.add(frame);
    }

    createTrain() {
        // Chrome Train Body
        const trainGroup = new THREE.Group();
        
        // Main Body - using Cylinder instead of Capsule for compatibility
        const bodyGeometry = new THREE.CylinderGeometry(1, 1, 4, 16);
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.9,
            roughness: 0.1,
            envMapIntensity: 2
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.z = Math.PI / 2;
        body.castShadow = true;
        trainGroup.add(body);
        
        // Windows
        for (let i = 0; i < 4; i++) {
            const windowGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.1);
            const windowMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x00f2ff,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x00f2ff,
                emissiveIntensity: 0.3
            });
            
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.x = (i - 1.5) * 1;
            window.position.y = 0.3;
            trainGroup.add(window);
        }
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const headlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 1
        });
        
        const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight1.position.set(2.2, 0, 0);
        trainGroup.add(headlight1);
        
        const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
        headlight2.position.set(2.2, 0, 0.3);
        trainGroup.add(headlight2);
        
        this.train = trainGroup;
        this.train.position.set(-10, 0, 0);
        this.scene.add(this.train);
    }

    createLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0x00f2ff, 0.2);
        this.scene.add(ambientLight);
        
        // Main Point Light
        const mainLight = new THREE.PointLight(0x00f2ff, 2, 50);
        mainLight.position.set(0, 10, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);
        
        // Secondary Point Light
        const secondaryLight = new THREE.PointLight(0x39ff14, 1, 30);
        secondaryLight.position.set(-10, 5, 0);
        this.scene.add(secondaryLight);
        
        // Spotlights for dramatic effect
        const spotLight1 = new THREE.SpotLight(0x00f2ff, 1);
        spotLight1.position.set(5, 10, 5);
        spotLight1.target = this.metroHub;
        spotLight1.angle = Math.PI / 6;
        spotLight1.penumbra = 0.3;
        spotLight1.castShadow = true;
        this.scene.add(spotLight1);
        
        const spotLight2 = new THREE.SpotLight(0x39ff14, 0.8);
        spotLight2.position.set(-5, 8, -5);
        spotLight2.target = this.metroHub;
        spotLight2.angle = Math.PI / 8;
        spotLight2.penumbra = 0.2;
        this.scene.add(spotLight2);
    }

    createEnvironment() {
        // Ground Plane with Grid
        const groundGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
        const groundMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -3;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Grid Lines
        const gridHelper = new THREE.GridHelper(100, 50, 0x00f2ff, 0x39ff14);
        gridHelper.position.y = -2.99;
        gridHelper.material.opacity = 0.3;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
        
        // Floating Particles
        this.createParticles();
    }

    createParticles() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            
            const color = Math.random() > 0.5 ? [0, 0.95, 1] : [0.22, 1, 0.08];
            colors[i * 3] = color[0];
            colors[i * 3 + 1] = color[1];
            colors[i * 3 + 2] = color[2];
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
    }

    createPulseRing(position) {
        const ringGeometry = new THREE.TorusGeometry(0.5, 0.1, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.userData = { 
            scale: 1, 
            opacity: 1, 
            growthRate: 0.05 
        };
        
        this.pulseRings.push(ring);
        this.scene.add(ring);
    }

    createLightTrail(position) {
        const trailGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0x00f2ff : 0x39ff14,
            transparent: true,
            opacity: 0.8
        });
        
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(position);
        trail.userData = { 
            opacity: 0.8, 
            fadeRate: 0.02 
        };
        
        this.lightTrails.push(trail);
        this.scene.add(trail);
    }

    setupEventListeners() {
        // Mouse Parallax
        document.addEventListener('mousemove', (event) => {
            this.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = (event.clientY / window.innerHeight) * 2 - 1;
        });
        
        // Window Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateTrain() {
        if (!this.train) return;
        
        // Infinity Loop Path
        const time = Date.now() * 0.001;
        const radius = 10;
        
        this.train.position.x = Math.cos(time * this.trainSpeed * 100) * radius;
        this.train.position.z = Math.sin(time * this.trainSpeed * 100) * radius;
        this.train.position.y = Math.sin(time * this.trainSpeed * 50) * 2;
        
        // Train Rotation
        const nextX = Math.cos(time * this.trainSpeed * 100 + 0.1) * radius;
        const nextZ = Math.sin(time * this.trainSpeed * 100 + 0.1) * radius;
        this.train.lookAt(nextX, this.train.position.y, nextZ);
        
        // Create Light Trails
        if (Math.random() < 0.3) {
            this.createLightTrail(this.train.position);
        }
    }

    updatePulseRings() {
        this.pulseTimer++;
        
        // Create new pulse every 60 frames (~1 second at 60fps)
        if (this.pulseTimer % 60 === 0 && this.train) {
            this.createPulseRing(this.train.position);
        }
        
        // Update existing rings
        for (let i = this.pulseRings.length - 1; i >= 0; i--) {
            const ring = this.pulseRings[i];
            const userData = ring.userData;
            
            userData.scale += userData.growthRate;
            userData.opacity -= 0.02;
            
            ring.scale.set(userData.scale, userData.scale, userData.scale);
            ring.material.opacity = userData.opacity;
            
            if (userData.opacity <= 0) {
                this.scene.remove(ring);
                this.pulseRings.splice(i, 1);
            }
        }
    }

    updateLightTrails() {
        for (let i = this.lightTrails.length - 1; i >= 0; i--) {
            const trail = this.lightTrails[i];
            const userData = trail.userData;
            
            userData.opacity -= userData.fadeRate;
            trail.material.opacity = userData.opacity;
            
            if (userData.opacity <= 0) {
                this.scene.remove(trail);
                this.lightTrails.splice(i, 1);
            }
        }
    }

    updateCamera() {
        // Mouse Parallax Effect
        this.camera.position.x += (this.mouseX * 2 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouseY * 1 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update Scene Elements
        this.updateTrain();
        this.updatePulseRings();
        this.updateLightTrails();
        this.updateCamera();
        
        // Rotate Metro Hub
        if (this.metroHub) {
            this.metroHub.rotation.y += 0.002;
        }
        
        // Render Scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize Metro Hyper-Loop when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MetroHyperLoop();
});
