/* global React, THREE */
(function () {
function MoleculeScene() {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const container = ref.current;
    if (!container || !window.THREE) return;

    let w = container.clientWidth;
    let h = container.clientHeight;
    if (w === 0 || h === 0) { w = 460; h = 460; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 200);
    camera.position.set(0, 0, 24);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    // C60: truncated icosahedron vertices
    const phi = (1 + Math.sqrt(5)) / 2;
    const seeds = [
      [0, 1, 3 * phi],
      [1, 2 + phi, 2 * phi],
      [phi, 2, 2 * phi + 1],
    ];
    const raw = [];
    seeds.forEach(([a, b, c]) => {
      [[a,b,c],[c,a,b],[b,c,a]].forEach(([x,y,z]) => {
        for (let sx = -1; sx <= 1; sx += 2)
          for (let sy = -1; sy <= 1; sy += 2)
            for (let sz = -1; sz <= 1; sz += 2)
              raw.push(new THREE.Vector3(x*sx, y*sy, z*sz));
      });
    });
    const verts = [];
    raw.forEach(v => { if (!verts.some(u => u.distanceTo(v) < 0.01)) verts.push(v); });
    const k = 5 / verts[0].length();
    verts.forEach(v => v.multiplyScalar(k));

    let minD = Infinity;
    for (let i = 0; i < verts.length; i++)
      for (let j = i+1; j < verts.length; j++)
        minD = Math.min(minD, verts[i].distanceTo(verts[j]));
    const edges = [];
    for (let i = 0; i < verts.length; i++)
      for (let j = i+1; j < verts.length; j++)
        if (verts[i].distanceTo(verts[j]) < minD * 1.05) edges.push([i,j]);

    const ATOM_BASE  = new THREE.Color(0x2a1810);
    const ATOM_GLOW  = new THREE.Color(0xF4C534);
    const ATOM_GLOW2 = new THREE.Color(0xD97A3A);
    const ATOM_GLOW3 = new THREE.Color(0xB58AC6);

    const atomGeo = new THREE.SphereGeometry(0.42, 32, 32);
    const atomMeshes = [];
    verts.forEach(v => {
      const mat = new THREE.MeshStandardMaterial({
        color: ATOM_BASE, metalness: 0.85, roughness: 0.25,
        emissive: ATOM_GLOW, emissiveIntensity: 0.4,
      });
      const m = new THREE.Mesh(atomGeo, mat);
      m.position.copy(v);
      group.add(m);
      atomMeshes.push({ mesh: m, mat, pos: v.clone() });
    });

    const haloGeo = new THREE.SphereGeometry(0.95, 16, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xFCECCF, transparent: true, opacity: 0.10,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    verts.forEach(v => {
      const m = new THREE.Mesh(haloGeo, haloMat);
      m.position.copy(v);
      group.add(m);
    });

    const bondGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 12, 1, true);
    bondGeo.translate(0, 0.5, 0);
    const bondMeshes = [];
    const upY = new THREE.Vector3(0, 1, 0);
    edges.forEach(([i,j]) => {
      const a = verts[i], b = verts[j];
      const mat = new THREE.MeshStandardMaterial({
        color: 0x6B5240, metalness: 0.7, roughness: 0.35,
        emissive: ATOM_GLOW, emissiveIntensity: 0.15,
      });
      const m = new THREE.Mesh(bondGeo, mat);
      const dir = b.clone().sub(a);
      m.scale.y = dir.length();
      m.position.copy(a);
      m.quaternion.setFromUnitVectors(upY, dir.clone().normalize());
      group.add(m);
      bondMeshes.push({ mesh: m, mat, mid: a.clone().add(b).multiplyScalar(0.5) });
    });

    const innerGeo = new THREE.SphereGeometry(3.4, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xF4C534, transparent: true, opacity: 0.18,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    const eGeo     = new THREE.SphereGeometry(0.13, 12, 12);
    const eHaloGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const eMat     = new THREE.MeshBasicMaterial({ color: 0xFFE38A });
    const eHaloMat = new THREE.MeshBasicMaterial({
      color: 0xFFD400, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const electrons = [];
    const tmp = new THREE.Vector3();
    for (let i = 0; i < 22; i++) {
      const m    = new THREE.Mesh(eGeo,     eMat);
      const halo = new THREE.Mesh(eHaloGeo, eHaloMat);
      group.add(m); group.add(halo);
      const axis = new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize();
      tmp.set(1,0,0);
      if (Math.abs(axis.dot(tmp)) > 0.95) tmp.set(0,1,0);
      const right = new THREE.Vector3().crossVectors(axis, tmp).normalize();
      const upv   = new THREE.Vector3().crossVectors(axis, right).normalize();
      electrons.push({
        m, halo,
        radius: 6.2 + Math.random() * 1.6,
        speed:  (0.15 + Math.random() * 0.35) * (Math.random() < 0.5 ? 1 : -1),
        phase:  Math.random() * Math.PI * 2,
        right, up: upv,
      });
    }

    const N = 280;
    const pGeo = new THREE.BufferGeometry();
    const pos  = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r  = 18 + Math.random() * 18;
      const a  = Math.random() * Math.PI * 2;
      const th = Math.acos(2 * Math.random() - 1);
      pos[i*3]   = r * Math.sin(th) * Math.cos(a);
      pos[i*3+1] = r * Math.sin(th) * Math.sin(a) * 0.45;
      pos[i*3+2] = r * Math.cos(th) - 6;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xD9A916, size: 0.09, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    scene.add(new THREE.AmbientLight(0xFCECCF, 0.55));
    const key  = new THREE.DirectionalLight(0xF4C534, 1.6); key.position.set(6,9,6);    scene.add(key);
    const fill = new THREE.DirectionalLight(0xB58AC6, 0.8); fill.position.set(-6,-3,-3); scene.add(fill);
    const rim  = new THREE.DirectionalLight(0x79B6D9, 0.6); rim.position.set(0,-2,-10); scene.add(rim);

    let tx = 0, ty = 0, mx = 0, my = 0;
    function onMove(e) {
      const r = container.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width  - 0.5;
      ty = (e.clientY - r.top)  / r.height - 0.5;
    }
    window.addEventListener("pointermove", onMove);

    const clock = new THREE.Clock();
    let frame;
    const tmpColor = new THREE.Color();
    const waveDir  = new THREE.Vector3(1, 0.4, 0.6).normalize();

    function animate() {
      const dt = clock.getDelta();
      const t  = clock.getElapsedTime();
      mx += (tx - mx) * 0.06;
      my += (ty - my) * 0.06;
      group.rotation.y += dt * 0.22 + mx * 0.015;
      group.rotation.x  = my * 0.5 + Math.sin(t * 0.18) * 0.08;

      waveDir.set(Math.cos(t*0.13), Math.sin(t*0.09)*0.6, Math.sin(t*0.11)).normalize();
      const speed = 2.8, lambda = 5.0;

      for (let i = 0; i < atomMeshes.length; i++) {
        const a = atomMeshes[i];
        const phase = (a.pos.dot(waveDir) - t * speed) / lambda * Math.PI * 2;
        const amp = 0.5 + 0.5 * Math.cos(phase);
        const hueT = ((a.pos.dot(waveDir) * 0.1 + t * 0.05) % 1 + 1) % 1;
        if (hueT < 0.5) tmpColor.lerpColors(ATOM_GLOW,  ATOM_GLOW2, hueT * 2);
        else            tmpColor.lerpColors(ATOM_GLOW2, ATOM_GLOW3, (hueT-0.5)*2);
        a.mat.emissive.copy(tmpColor);
        a.mat.emissiveIntensity = 0.25 + amp * 1.4;
        a.mesh.scale.setScalar(1 + amp * 0.18);
      }
      for (let i = 0; i < bondMeshes.length; i++) {
        const b = bondMeshes[i];
        const phase = (b.mid.dot(waveDir) - t * speed) / lambda * Math.PI * 2;
        const amp = 0.5 + 0.5 * Math.cos(phase);
        b.mat.emissiveIntensity = 0.05 + amp * 0.9;
      }

      innerMesh.material.opacity = 0.14 + Math.sin(t * 1.6) * 0.07;
      innerMesh.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);

      for (let i = 0; i < electrons.length; i++) {
        const e = electrons[i];
        const ang = e.phase + t * e.speed;
        const x = Math.cos(ang) * e.radius;
        const y = Math.sin(ang) * e.radius;
        e.m.position.set(e.right.x*x+e.up.x*y, e.right.y*x+e.up.y*y, e.right.z*x+e.up.z*y);
        e.halo.position.copy(e.m.position);
      }

      points.rotation.y += dt * 0.025;
      points.rotation.x += dt * 0.012;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);

    const ro = new ResizeObserver(() => {
      const ww = container.clientWidth, hh = container.clientHeight;
      if (ww > 0 && hh > 0) {
        renderer.setSize(ww, hh);
        camera.aspect = ww / hh;
        camera.updateProjectionMatrix();
      }
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      atomMeshes.forEach(a => a.mat.dispose());
      bondMeshes.forEach(b => b.mat.dispose());
      [atomGeo,haloGeo,bondGeo,innerGeo,innerMat,haloMat,eGeo,eHaloGeo,eMat,eHaloMat,pGeo,pMat].forEach(x => x.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return React.createElement("div", { ref, className: "molecule-canvas" });
}
window.MoleculeScene = MoleculeScene;
})();
