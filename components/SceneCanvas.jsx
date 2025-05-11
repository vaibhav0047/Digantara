import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SceneCanvas = () => {
  const mountRef = useRef(null);

useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, stencil: true });
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x202020);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(5, 5, 10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7);
    scene.add(light);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    const geometries = [
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.SphereGeometry(0.5, 32, 32),
      new THREE.ConeGeometry(0.5, 1, 32),
      new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
      new THREE.TorusGeometry(0.5, 0.2, 16, 100),
    ];

    const objects = [];
    const spacing = 3;

    geometries.forEach((geo, i) => {
      geo.computeBoundingBox();
      const height = geo.boundingBox.max.y - geo.boundingBox.min.y;

      const mat = new THREE.MeshStandardMaterial({ color: 0x8888ff });
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set((i - 2) * spacing, height / 2 + 0.01, 0);  
      scene.add(mesh);
      objects.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;
    let highlightMesh = null;

    const onMouseClick = (event) => {
      const bounds = renderer.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(objects, false);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        if (selectedObject !== object) {
          selectedObject = object;

          if (highlightMesh) scene.remove(highlightMesh);

          highlightMesh = new THREE.Mesh(
            object.geometry.clone(),
            new THREE.MeshBasicMaterial({
              color: 0xffff00,
              side: THREE.BackSide,
              depthTest: true,
              depthWrite: false,
            })
          );

          highlightMesh.position.copy(object.position);
          highlightMesh.rotation.copy(object.rotation);
          highlightMesh.scale.copy(object.scale).multiplyScalar(1.1);
          scene.add(highlightMesh);
        }
      }
    };

    window.addEventListener('click', onMouseClick);


    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('click', onMouseClick);
      if (renderer) {
        renderer.dispose();
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default SceneCanvas;
