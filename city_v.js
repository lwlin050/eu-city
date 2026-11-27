(function () {
  // 【1. 色票與日夜對應材質（適應旅遊島正午強光，不發白、不單調）】
  const PALETTE = {
    day: {
      baseTop: 0xcab899,
      baseSide: 0x9c8868,
      baseBottom: 0x76654b,
      rimStone: 0xb5a182,
      road: 0x4a4744,
      curbStone: 0xd9d4cc,
      sidewalk: 0xa89f93,
      river: 0x3d85ad,
      riverBank: 0xf4e3a4, // [Claude] 與城際多瑙河的沙色河岸 (0xcdbf8a) 一致（白天會乘 0.84）
      park: 0x577a44,
      parkAlt: 0x456635,
      parkWarm: 0x6e8a49,
      plaza: 0xd5c4a5,

      // 8 種牆面色（皆套用立面貼圖）
      wallSchonbrunn: 0xe8c26a,
      wallApricot: 0xe9b8a2,
      wallMint: 0xb9d6c2,
      wallSky: 0xb8cfe3,
      wallCream: 0xefe4cc,
      wallSalmon: 0xe7a07c,
      wallLavender: 0xcdbfdc,
      wallSandstone: 0xd8c3a0,

      // 5 種屋頂色
      roofTerracotta: 0xb3523a,
      roofCopper: 0x4f8a78,
      roofSlate: 0x56657a,
      roofBrown: 0x6b4a35,
      roofOchre: 0xc08a3e,

      // 輔助色
      creamWall: 0xe6d6bc,
      warmSand: 0xd4be9c,
      softPeach: 0xe0b296,
      paleSage: 0xb3c4a6,
      gold: 0xc9962c,
      viennaRed: 0xb83535,
      white: 0xeae2d3,
      darkWood: 0x4a3220,
      horseWhite: 0xe4ddd0,
      horseDark: 0x2f2720,
      line: 0x241d17,
      windowGlow: 0xffe49e
    },
    night: {
      baseTop: 0x1a2436,
      baseSide: 0x121926,
      baseBottom: 0x0b0f18,
      rimStone: 0x27344a,
      road: 0x232936,
      curbStone: 0x6c788e,
      sidewalk: 0x3b4456,
      river: 0x183952,
      riverBank: 0x1e332e,
      park: 0x1a3326,
      parkAlt: 0x14281e,
      parkWarm: 0x243d2a,
      plaza: 0x293347,

      // 8 種牆面色各自對應夜間色
      wallSchonbrunn: 0x735924,
      wallApricot: 0x75493e,
      wallMint: 0x2e5446,
      wallSky: 0x2c4b66,
      wallCream: 0x595347,
      wallSalmon: 0x733c29,
      wallLavender: 0x4a3d61,
      wallSandstone: 0x5c4e3a,

      // 5 種屋頂色各自對應夜間色
      roofTerracotta: 0x5e2418,
      roofCopper: 0x1e4a3f,
      roofSlate: 0x232d3d,
      roofBrown: 0x362214,
      roofOchre: 0x614116,

      creamWall: 0x434d61,
      warmSand: 0x3b4354,
      softPeach: 0x4d3b42,
      paleSage: 0x293d38,
      gold: 0xf7c85c,
      viennaRed: 0xcf4242,
      white: 0xcad5e3,
      darkWood: 0x2e1f14,
      horseWhite: 0xbec9d6,
      horseDark: 0x221e26,
      line: 0xdbeafe,
      windowGlow: 0xffc857
    }
  };

  const WALL_COLOR_KEYS = [
    'wallSchonbrunn',
    'wallApricot',
    'wallMint',
    'wallSky',
    'wallCream',
    'wallSalmon',
    'wallLavender',
    'wallSandstone'
  ];

  const ROOF_COLOR_KEYS = [
    'roofTerracotta',
    'roofCopper',
    'roofSlate',
    'roofBrown',
    'roofOchre'
  ];

  // [Claude] 道路收窄：原本總寬 0.66（柏油 0.40），比公車車長 (0.42) 還寬，像公車能橫著開；
  // 道路不是主角，改為柏油 0.26、路緣 0.012、人行道 0.07，總寬約 0.40。
  const ROAD_SPEC = {
    asphalt: 0.26,
    sidewalk: 0.07
  };
  const CURB_W = 0.012;
  const ROAD_HALF = ROAD_SPEC.asphalt * 0.5 + CURB_W + ROAD_SPEC.sidewalk; // 0.202
  const JUNC_R = ROAD_HALF; // 路口柏油圓半徑，剛好接到人行道外緣
  // [Claude] 代表性大橋（帝國大橋）的預留帶：buildCityV 開頭決定位置，街屋／樹／花圃都避開
  let BRIDGE_ZONE = null;
  function inBridgeZone(x, z, pad) {
    const B = BRIDGE_ZONE;
    if (!B) return false;
    return distToSegmentSq(x, z, B.ax, B.az, B.bx, B.bz) < Math.pow(B.r + (pad || 0), 2);
  }

  const LANDMARK_ANCHORS = {
    '聖史蒂芬大教堂': { x: 2.7, z: 0.96, ry: -1.69, r: 0.8 },
    '國家歌劇院': { x: -0.52, z: 5.45, ry: -2.59, r: 0.8 },
    '霍夫堡皇宮': { x: -4.11, z: 1.45, ry: -1.2, r: 0.75 },
    // [Claude] 美泉宮四周可用空間呈細長帶狀（沿平台邊緣），圓形半徑只容得下 0.35，宮殿比人行道還小。
    // 改用長方形配置：len＝長邊總長，主軸沿平台切線（ry -1.05），深度約 0.48，檢查過不壓道路、路口、河流與平台邊緣。
    '美泉宮': { x: -5.34, z: 3.13, ry: -1.05, r: 0.35, len: 1.5 },
    '普拉特與大摩天輪': { x: 4.27, z: -3.85, ry: 0.22, r: 0.8 },
    '美景宮 Belvedere': { x: 4.83, z: 3.11, ry: -0.89, r: 0.8 },
    '藝術史博物館 KHM': { x: -6.06, z: 0.52, ry: 1.34, r: 0.52 } /* [Claude] 路窄後可放大 */,
    '卡爾教堂': { x: 1.11, z: 5.6, ry: 2.78, r: 0.79 },
    '百水公寓': { x: 5.71, z: 0.69, ry: -0.84, r: 0.8 },
    '市政廳廣場': { x: -4.22, z: -0.86, ry: -0.58, r: 0.54 } /* [Claude] 路窄後可放大 */
  };

  const MAP_DATA = {
    name: '維也納',
    nodes: [
      [-4.79, 2.71], [1.49, 1.35], [-5.38, 1.17], [3.94, 3.83], [1.68, -0.29],
      [-5.09, -2.09], [-3.62, 0.46], [-0.7, 4.21], [4.52, -2.71], [0.95, 4.32],
      [4.84, 1.47], [3.27, 1.98], [-3.58, -1.43], [-0.68, -5.41], [-1.03, 2.29],
      [-2.1, 5.08], [3.09, -1.47], [-0.1, 0.93], [0.56, 2.72], [-1.5, -2.85],
      [-5, -0.44], [-3.77, 4.01], [-2.22, 3.44], [-0.41, -0.69], [-1.82, 0.84],
      [-3, 1.99], [0.3, -2.37], [-2.05, -0.79], [2.5, 4.9], [-3.03, -3.46],
      [2.24, 3.27]
    ],
    edges: [
      [0, 2], [2, 20], [20, 5], [5, 12], [0, 21], [21, 22], [22, 14], [14, 17],
      [17, 23], [17, 1], [14, 18], [12, 27], [18, 9], [9, 7], [7, 15], [14, 24],
      [20, 6], [9, 28], [28, 30], [24, 25], [30, 11], [11, 10], [1, 4], [30, 3],
      [23, 26], [4, 16], [26, 19], [19, 29], [16, 8], [19, 13], [15, 22], [23, 27],
      [24, 27]
    ],
    river: [
      [-5.87, -3.34], [-5.62, -3.23], [-5.37, -3.13], [-5.12, -3.03], [-4.88, -2.92],
      [-4.63, -2.82], [-4.38, -2.72], [-4.13, -2.61], [-3.89, -2.5], [-3.64, -2.39],
      [-3.4, -2.28], [-3.15, -2.18], [-2.89, -2.08], [-2.63, -1.99], [-2.34, -1.91],
      [-2.04, -1.84], [-1.74, -1.78], [-1.44, -1.72], [-1.13, -1.67], [-0.81, -1.61],
      [-0.49, -1.56], [-0.15, -1.52], [0.19, -1.49], [0.54, -1.45], [0.88, -1.41],
      [1.21, -1.35], [1.53, -1.27], [1.84, -1.15], [2.14, -1], [2.44, -0.85],
      [2.73, -0.7], [3.02, -0.59], [3.29, -0.54], [3.51, -0.54], [3.7, -0.58],
      [3.89, -0.64], [4.07, -0.71], [4.26, -0.8], [4.46, -0.88], [4.7, -0.95],
      [5, -1.04], [5.3, -1.14], [5.62, -1.23], [5.94, -1.33], [6.26, -1.43],
      [6.58, -1.53]
    ],
    parks: [
      [3.78, -1.26, 1.89],
      [1.45, 1.02, 0.44],
      [-4.77, 2.67, 1.6],
      [2.02, 2.55, 0.58],
      [-0.74, -5.9, 2.17]
    ],
    plaza: [2.16, -2.51],
    poi: [
      { name: '美泉宮', type: 'sight', x: -5.44, z: 3.08 },
      { name: '聖史蒂芬大教堂', type: 'sight', x: 2.05, z: 1.86 },
      { name: '藝術史博物館 KHM', type: 'museum', x: -6.11, z: 1.32 },
      { name: '美景宮 Belvedere', type: 'museum', x: 4.48, z: 4.36 },
      { name: 'Figlmüller Wollzeile', type: 'restaurant', x: 2.42, z: -0.42 },
      { name: 'Café Central', type: 'restaurant', x: -5.78, z: -2.37 },
      { name: '霍夫堡皇宮', type: 'sight', x: -4.36, z: 0.55 },
      { name: '國家歌劇院', type: 'sight', x: -0.82, z: 4.95 },
      { name: '普拉特與大摩天輪', type: 'sight', x: 5.17, z: -3.1 },
      { name: '卡爾教堂', type: 'sight', x: 1.11, z: 5.05 },
      { name: '百水公寓', type: 'sight', x: 5.56, z: 1.69 },
      { name: '市立公園', type: 'sight', x: 3.91, z: 2.37 },
      { name: '市政廳廣場', type: 'sight', x: -4.27, z: -1.71 },
      { name: '卡倫山', type: 'sight', x: -0.77, z: -6.16 },
      { name: '嘉布遣會地下墓室', type: 'sight', x: -1.34, z: 2.97 },
      { name: '納旭市場', type: 'sight', x: -2.38, z: 5.78 },
      { name: 'Plachutta Wollzeile', type: 'restaurant', x: 3.77, z: -1.8 },
      { name: 'Zum Schwarzen Kameel', type: 'restaurant', x: -0.19, z: 1.67 },
      { name: 'Café Sacher', type: 'restaurant', x: 0.71, z: 3.45 },
      { name: 'Café Demel', type: 'restaurant', x: -1.85, z: -3.51 },
      { name: 'Café Landtmann', type: 'restaurant', x: -5.75, z: -0.51 },
      { name: 'Café Sperl', type: 'restaurant', x: -4.28, z: 4.55 },
      { name: 'Neni am Naschmarkt', type: 'restaurant', x: -2.63, z: 4.07 },
      { name: 'Meinl am Graben', type: 'restaurant', x: -0.78, z: -1.34 },
      { name: 'Trzesniewski', type: 'restaurant', x: -2.5, z: 1.15 },
      { name: 'Würstelstand Bitzinger', type: 'restaurant', x: -3.63, z: 2.4 },
      { name: '維也納地鐵', type: 'transport', x: 0.39, z: -3.12 },
      { name: '維也納電車與公車', type: 'transport', x: -2.75, z: -1.07 },
      { name: '維也納火車與機場', type: 'transport', x: 2.84, z: 5.57 },
      { name: '市政廳廣場公廁', type: 'toilet', x: -3.53, z: -4.03 },
      { name: '卡爾廣場公廁（新建）', type: 'toilet', x: 2.67, z: 3.89 }
    ]
  };

  const SURFACE_Y = 0.33;
  const MAX_RADIUS = 6.85;
  const RIVER_WIDTH = 0.62;

  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function mergeGeometriesManual(THREE, geoList) {
    const prepared = [];
    let totalVerts = 0;
    let anyUv = false;

    for (let i = 0; i < geoList.length; i++) {
      let g = geoList[i];
      if (!g || !g.getAttribute('position')) continue;
      if (g.index) g = g.toNonIndexed();
      if (!g.getAttribute('normal')) g.computeVertexNormals();
      const pos = g.getAttribute('position');
      const norm = g.getAttribute('normal');
      const uv = g.getAttribute('uv');
      if (!pos || !norm) continue;
      if (uv) anyUv = true;
      prepared.push({ pos, norm, uv });
      totalVerts += pos.count;
    }

    const positions = new Float32Array(totalVerts * 3);
    const normals = new Float32Array(totalVerts * 3);
    const uvs = anyUv ? new Float32Array(totalVerts * 2) : null;
    let offset3 = 0;
    let offset2 = 0;

    for (let i = 0; i < prepared.length; i++) {
      const { pos, norm, uv } = prepared[i];
      const count3 = pos.count * 3;
      const count2 = pos.count * 2;
      positions.set(pos.array.subarray(0, count3), offset3);
      normals.set(norm.array.subarray(0, count3), offset3);
      if (uvs && uv) {
        uvs.set(uv.array.subarray(0, count2), offset2);
      }
      offset3 += count3;
      offset2 += count2;
    }

    const merged = new THREE.BufferGeometry();
    merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    if (uvs) merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    return merged;
  }

  function distToSegmentSq(px, pz, ax, az, bx, bz) {
    const vx = bx - ax;
    const vz = bz - az;
    const wx = px - ax;
    const wz = pz - az;
    const lenSq = vx * vx + vz * vz;
    let t = lenSq > 1e-6 ? (wx * vx + wz * vz) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * vx;
    const cz = az + t * vz;
    const dx = px - cx;
    const dz = pz - cz;
    return dx * dx + dz * dz;
  }

  // 建築與樹木距道路中心線至少 0.40；並避開地標擺放點（可用半徑 + 0.05 + 餘裕）
  function isClearForPlacement(x, z, clearanceRadius, mapData, extraMargin) {
    const margin = typeof extraMargin === 'number' ? extraMargin : 0;
    if (inBridgeZone(x, z, clearanceRadius + margin)) return false;
    if (Math.hypot(x, z) + clearanceRadius + margin > MAX_RADIUS - 0.18) return false;

    for (let i = 0; i < mapData.poi.length; i++) {
      const p = mapData.poi[i];
      if (Math.hypot(x - p.x, z - p.z) < 0.45 + clearanceRadius + margin) return false;
    }

    const anchorKeys = Object.keys(LANDMARK_ANCHORS);
    for (let i = 0; i < anchorKeys.length; i++) {
      const a = LANDMARK_ANCHORS[anchorKeys[i]];
      if (Math.hypot(x - a.x, z - a.z) < a.r + 0.05 + clearanceRadius + margin) return false;
    }

    const minRoadDist = ROAD_HALF + 0.07 + clearanceRadius + margin; // [Claude] 依新路寬
    const minRoadDistSq = minRoadDist * minRoadDist;
    for (let i = 0; i < mapData.edges.length; i++) {
      const a = mapData.nodes[mapData.edges[i][0]];
      const b = mapData.nodes[mapData.edges[i][1]];
      if (distToSegmentSq(x, z, a[0], a[1], b[0], b[1]) < minRoadDistSq) return false;
    }

    const minRiverDist = 0.45 + clearanceRadius + margin;
    const minRiverDistSq = minRiverDist * minRiverDist;
    for (let i = 0; i < mapData.river.length - 1; i++) {
      const a = mapData.river[i];
      const b = mapData.river[i + 1];
      if (distToSegmentSq(x, z, a[0], a[1], b[0], b[1]) < minRiverDistSq) return false;
    }
    return true;
  }

  function isInsidePlaza(x, z, mapData) {
    if (!mapData.plaza) return false;
    return Math.hypot(x - mapData.plaza[0], z - mapData.plaza[1]) <= 1.54;
  }

  function buildRibbonGeometry(THREE, pts, width, yBottom, yTop) {
    const halfW = width * 0.5;
    const n = pts.length;
    if (n < 2) return new THREE.BufferGeometry();

    const leftPts = [];
    const rightPts = [];

    for (let i = 0; i < n; i++) {
      let tx = 0;
      let tz = 0;
      if (i === 0) {
        tx = pts[1][0] - pts[0][0];
        tz = pts[1][1] - pts[0][1];
      } else if (i === n - 1) {
        tx = pts[n - 1][0] - pts[n - 2][0];
        tz = pts[n - 1][1] - pts[n - 2][1];
      } else {
        const dx1 = pts[i][0] - pts[i - 1][0];
        const dz1 = pts[i][1] - pts[i - 1][1];
        const len1 = Math.hypot(dx1, dz1) || 1;
        const dx2 = pts[i + 1][0] - pts[i][0];
        const dz2 = pts[i + 1][1] - pts[i][1];
        const len2 = Math.hypot(dx2, dz2) || 1;
        tx = dx1 / len1 + dx2 / len2;
        tz = dz1 / len1 + dz2 / len2;
      }
      const tLen = Math.hypot(tx, tz) || 1;
      tx /= tLen;
      tz /= tLen;

      const nx = -tz;
      const nz = tx;

      leftPts.push([pts[i][0] + nx * halfW, pts[i][1] + nz * halfW]);
      rightPts.push([pts[i][0] - nx * halfW, pts[i][1] - nz * halfW]);
    }

    const triPositions = [];
    function pushTri(ax, ay, az, bx, by, bz, cx, cy, cz) {
      triPositions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    }

    for (let i = 0; i < n - 1; i++) {
      const l0 = leftPts[i];
      const r0 = rightPts[i];
      const l1 = leftPts[i + 1];
      const r1 = rightPts[i + 1];

      pushTri(l0[0], yTop, l0[1], l1[0], yTop, l1[1], r1[0], yTop, r1[1]);
      pushTri(l0[0], yTop, l0[1], r1[0], yTop, r1[1], r0[0], yTop, r0[1]);

      pushTri(l0[0], yBottom, l0[1], l1[0], yBottom, l1[1], l1[0], yTop, l1[1]);
      pushTri(l0[0], yBottom, l0[1], l1[0], yTop, l1[1], l0[0], yTop, l0[1]);

      pushTri(r1[0], yBottom, r1[1], r0[0], yBottom, r0[1], r0[0], yTop, r0[1]);
      pushTri(r1[0], yBottom, r1[1], r0[0], yTop, r0[1], r1[0], yTop, r1[1]);
    }

    const lStart = leftPts[0];
    const rStart = rightPts[0];
    pushTri(rStart[0], yBottom, rStart[1], lStart[0], yBottom, lStart[1], lStart[0], yTop, lStart[1]);
    pushTri(rStart[0], yBottom, rStart[1], lStart[0], yTop, lStart[1], rStart[0], yTop, rStart[1]);

    const lEnd = leftPts[n - 1];
    const rEnd = rightPts[n - 1];
    pushTri(lEnd[0], yBottom, lEnd[1], rEnd[0], yBottom, rEnd[1], rEnd[0], yTop, rEnd[1]);
    pushTri(lEnd[0], yBottom, lEnd[1], rEnd[0], yTop, rEnd[1], lEnd[0], yTop, lEnd[1]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(triPositions, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // 古典立面窗格貼圖
  function createFacadeTextures(THREE, disposables) {
    const diffCanvas = document.createElement('canvas');
    diffCanvas.width = 128;
    diffCanvas.height = 128;
    const ctx = diffCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = 'rgba(65, 50, 36, 0.25)';
    ctx.fillRect(0, 0, 128, 6);
    ctx.fillRect(0, 42, 128, 4);
    ctx.fillRect(0, 84, 128, 4);
    ctx.fillRect(0, 122, 128, 6);

    ctx.fillStyle = 'rgba(55, 42, 30, 0.14)';
    ctx.fillRect(0, 0, 5, 128);
    ctx.fillRect(123, 0, 5, 128);

    const emCanvas = document.createElement('canvas');
    emCanvas.width = 128;
    emCanvas.height = 128;
    const ectx = emCanvas.getContext('2d');
    ectx.fillStyle = '#000000';
    ectx.fillRect(0, 0, 128, 128);

    const cols = 4;
    const rows = 3;
    for (let r = 0; r < rows; r++) {
      const wy = 11 + r * 42;
      const wh = 24;
      for (let c = 0; c < cols; c++) {
        const wx = 12 + c * 28;
        const ww = 16;

        ctx.fillStyle = '#574636';
        ctx.fillRect(wx - 2, wy - 2, ww + 4, wh + 4);
        ctx.fillStyle = '#363d47';
        ctx.fillRect(wx, wy, ww, wh);
        ctx.fillStyle = '#ded4c3';
        ctx.fillRect(wx + ww * 0.5 - 1, wy, 2, wh);
        ctx.fillRect(wx, wy + wh * 0.42, ww, 2);

        if ((r * 7 + c * 3) % 3 !== 0) {
          ectx.fillStyle = '#ffcf6e';
          ectx.fillRect(wx + 1, wy + 1, ww - 2, wh - 2);
        }
      }
    }

    const diffTex = new THREE.CanvasTexture(diffCanvas);
    diffTex.wrapS = THREE.RepeatWrapping;
    diffTex.wrapT = THREE.RepeatWrapping;
    diffTex.repeat.set(1.5, 1.2);

    const emTex = new THREE.CanvasTexture(emCanvas);
    emTex.wrapS = THREE.RepeatWrapping;
    emTex.wrapT = THREE.RepeatWrapping;
    emTex.repeat.set(1.5, 1.2);

    disposables.push(diffTex, emTex);
    return { diffTex, emTex };
  }

  // 人行道方磚縫線貼圖與芒薩爾屋頂老虎窗貼圖
  function createSidewalkAndMansardTextures(THREE, disposables) {
    const swCanvas = document.createElement('canvas');
    swCanvas.width = 128;
    swCanvas.height = 128;
    const sctx = swCanvas.getContext('2d');
    sctx.fillStyle = '#ffffff';
    sctx.fillRect(0, 0, 128, 128);
    sctx.strokeStyle = 'rgba(48, 42, 36, 0.36)';
    sctx.lineWidth = 2;
    const grid = 32;
    for (let x = 0; x <= 128; x += grid) {
      sctx.beginPath();
      sctx.moveTo(x, 0);
      sctx.lineTo(x, 128);
      sctx.stroke();
    }
    for (let y = 0; y <= 128; y += grid) {
      sctx.beginPath();
      sctx.moveTo(0, y);
      sctx.lineTo(128, y);
      sctx.stroke();
    }
    const swTex = new THREE.CanvasTexture(swCanvas);
    swTex.wrapS = THREE.RepeatWrapping;
    swTex.wrapT = THREE.RepeatWrapping;
    swTex.repeat.set(8, 2);

    const mCanvas = document.createElement('canvas');
    mCanvas.width = 128;
    mCanvas.height = 128;
    const mctx = mCanvas.getContext('2d');
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, 128, 128);
    mctx.fillStyle = 'rgba(30, 24, 18, 0.16)';
    for (let y = 0; y < 128; y += 16) {
      mctx.fillRect(0, y, 128, 2);
    }
    // 畫出老虎窗（Dormer windows）
    for (let i = 0; i < 4; i++) {
      const dx = 14 + i * 30;
      const dy = 48;
      mctx.fillStyle = '#efe5d3';
      mctx.fillRect(dx, dy, 16, 22);
      mctx.beginPath();
      mctx.moveTo(dx - 2, dy);
      mctx.lineTo(dx + 8, dy - 10);
      mctx.lineTo(dx + 18, dy);
      mctx.closePath();
      mctx.fillStyle = '#3b424c';
      mctx.fill();
      mctx.fillStyle = '#2d3540';
      mctx.fillRect(dx + 3, dy + 4, 10, 14);
    }
    const mansardTex = new THREE.CanvasTexture(mCanvas);
    mansardTex.wrapS = THREE.RepeatWrapping;
    mansardTex.wrapT = THREE.RepeatWrapping;
    mansardTex.repeat.set(1.5, 1);

    disposables.push(swTex, mansardTex);
    return { swTex, mansardTex };
  }

  function createSharedResources(THREE, quality, disposables) {
    const mats = {};
    const keys = Object.keys(PALETTE.day);
    keys.forEach((k) => {
      mats[k] = new THREE.MeshStandardMaterial({
        color: PALETTE.day[k],
        roughness: 0.88,
        metalness: 0.03
      });
      disposables.push(mats[k]);
    });

    const { diffTex, emTex } = createFacadeTextures(THREE, disposables);
    const { swTex, mansardTex } = createSidewalkAndMansardTextures(THREE, disposables);

    mats.sidewalk.map = swTex;
    mats.sidewalk.roughness = 0.86;

    const facadeKeys = WALL_COLOR_KEYS.concat(['creamWall', 'warmSand', 'softPeach', 'paleSage']);
    facadeKeys.forEach((fk) => {
      mats[fk + 'Facade'] = new THREE.MeshStandardMaterial({
        color: PALETTE.day[fk],
        map: diffTex,
        emissive: 0xffc857,
        emissiveMap: emTex,
        emissiveIntensity: 0.0,
        roughness: 0.85,
        metalness: 0.03
      });
      disposables.push(mats[fk + 'Facade']);
    });

    ROOF_COLOR_KEYS.forEach((rk) => {
      mats[rk + 'Mansard'] = new THREE.MeshStandardMaterial({
        color: PALETTE.day[rk],
        map: mansardTex,
        roughness: 0.82,
        metalness: 0.04
      });
      disposables.push(mats[rk + 'Mansard']);
    });

    mats.windowGlow = new THREE.MeshStandardMaterial({
      color: PALETTE.day.windowGlow,
      emissive: 0xffc857,
      emissiveIntensity: 0.0,
      roughness: 0.45,
      metalness: 0.08
    });
    disposables.push(mats.windowGlow);

    mats.snowCover = new THREE.MeshStandardMaterial({
      color: 0xeef3f8,
      roughness: 0.92,
      metalness: 0.0,
      transparent: true,
      opacity: 0.0
      // [Claude] 雪面已放在柏油之下，移除負向 polygonOffset，避免雪蓋過道路
    });
    disposables.push(mats.snowCover);

    mats.roadSnow = new THREE.MeshStandardMaterial({
      color: 0xdbe3ec,
      roughness: 0.9,
      metalness: 0.0,
      transparent: true,
      opacity: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -2
    });
    disposables.push(mats.roadSnow);

    mats.line = new THREE.LineBasicMaterial({
      color: PALETTE.day.line,
      transparent: true,
      opacity: 0.82
    });
    disposables.push(mats.line);

    const roofCanvas = document.createElement('canvas');
    roofCanvas.width = 128;
    roofCanvas.height = 128;
    const rctx = roofCanvas.getContext('2d');
    rctx.fillStyle = '#4c5561';
    rctx.fillRect(0, 0, 128, 128);
    const step = 14;
    const tileColors = ['#b35439', '#43786a', '#c9962c', '#3c4652'];
    for (let y = -step; y < 128 + step; y += step) {
      for (let x = -step; x < 128 + step; x += step) {
        const idx = Math.abs(((x / step + y / step) | 0)) % tileColors.length;
        rctx.save();
        rctx.translate(x, y);
        rctx.rotate(Math.PI / 4);
        rctx.fillStyle = tileColors[idx];
        rctx.fillRect(-step * 0.45, -step * 0.45, step * 0.9, step * 0.9);
        rctx.strokeStyle = '#231d18';
        rctx.lineWidth = 1.2;
        rctx.strokeRect(-step * 0.45, -step * 0.45, step * 0.9, step * 0.9);
        rctx.restore();
      }
    }
    const roofTex = new THREE.CanvasTexture(roofCanvas);
    roofTex.wrapS = THREE.RepeatWrapping;
    roofTex.wrapT = THREE.RepeatWrapping;
    roofTex.repeat.set(3, 2);
    disposables.push(roofTex);

    mats.stephanRoof = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.75,
      metalness: 0.06
    });
    disposables.push(mats.stephanRoof);

    mats.crosswalkAsphalt = new THREE.MeshStandardMaterial({
      color: 0x3b3734,
      roughness: 0.9,
      metalness: 0.02
    });
    mats.crosswalkStripe = new THREE.MeshStandardMaterial({
      color: 0xeae4d7,
      roughness: 0.85,
      metalness: 0.02,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    mats.flagRed = new THREE.MeshStandardMaterial({
      color: PALETTE.day.viennaRed,
      roughness: 0.78,
      side: THREE.DoubleSide
    });
    mats.flagWhite = new THREE.MeshStandardMaterial({
      color: PALETTE.day.white,
      roughness: 0.78,
      side: THREE.DoubleSide
    });
    mats.water = new THREE.MeshStandardMaterial({
      color: 0x5da9d4,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.86
    });
    disposables.push(mats.crosswalkAsphalt, mats.crosswalkStripe, mats.flagRed, mats.flagWhite, mats.water);

    return { mats, segs: quality === 'low' ? 12 : 20 };
  }

  // 【3. 地面、底座圍邊、三層道路橫斷面、修復高度的河流、公園】
  function buildTerrainAndBase(THREE, mats, segs, mapData, disposables) {
    const group = new THREE.Group();
    const staticEdgeGeos = [];

    const islandShape = new THREE.Shape();
    const ptsCount = 56;
    const basePts = [];
    for (let i = 0; i < ptsCount; i++) {
      const ang = (i / ptsCount) * Math.PI * 2;
      const wave = 1 + 0.025 * Math.cos(ang * 3 + 0.4) - 0.015 * Math.sin(ang * 2 - 0.5);
      const rad = Math.min(6.74, 6.56 * wave);
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      basePts.push([px, py]);
      if (i === 0) islandShape.moveTo(px, py);
      else islandShape.lineTo(px, py);
    }
    islandShape.closePath();

    const extrudeGeo = new THREE.ExtrudeGeometry(islandShape, {
      depth: 0.56,
      bevelEnabled: true,
      bevelThickness: 0.035,
      bevelSize: 0.035,
      bevelSegments: 2,
      curveSegments: segs
    });
    extrudeGeo.rotateX(-Math.PI / 2);
    const bbox = new THREE.Box3().setFromBufferAttribute(extrudeGeo.getAttribute('position'));
    extrudeGeo.translate(0, SURFACE_Y - bbox.max.y, 0);

    const baseMesh = new THREE.Mesh(extrudeGeo, mats.baseTop);
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    group.add(baseMesh);
    disposables.push(extrudeGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(extrudeGeo, 30));

    const skirtGeo = new THREE.CylinderGeometry(5.85, 3.6, 0.28, Math.max(32, segs * 2), 1);
    skirtGeo.translate(0, SURFACE_Y - 0.56 - 0.14, 0);
    const skirtMesh = new THREE.Mesh(skirtGeo, mats.baseSide);
    skirtMesh.receiveShadow = true;
    group.add(skirtMesh);
    disposables.push(skirtGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(skirtGeo, 28));

    const rimOuterShape = new THREE.Shape();
    for (let i = 0; i < ptsCount; i++) {
      const [bx, by] = basePts[i];
      const sx = bx * 1.005;
      const sy = by * 1.005;
      if (i === 0) rimOuterShape.moveTo(sx, sy);
      else rimOuterShape.lineTo(sx, sy);
    }
    rimOuterShape.closePath();

    const rimHole = new THREE.Path();
    for (let i = ptsCount - 1; i >= 0; i--) {
      const [bx, by] = basePts[i];
      const sx = bx * 0.978;
      const sy = by * 0.978;
      if (i === ptsCount - 1) rimHole.moveTo(sx, sy);
      else rimHole.lineTo(sx, sy);
    }
    rimHole.closePath();
    rimOuterShape.holes.push(rimHole);

    const rimGeo = new THREE.ExtrudeGeometry(rimOuterShape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 1
    });
    rimGeo.rotateX(-Math.PI / 2);
    rimGeo.translate(0, SURFACE_Y - 0.02, 0);
    const rimMesh = new THREE.Mesh(rimGeo, mats.rimStone);
    rimMesh.castShadow = true;
    rimMesh.receiveShadow = true;
    group.add(rimMesh);
    disposables.push(rimGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(rimGeo, 28));

    const parkGeos = [];
    for (let i = 0; i < mapData.parks.length; i++) {
      const [px, pz, pr] = mapData.parks[i];
      const clampedR = Math.min(pr, Math.max(0.25, MAX_RADIUS - Math.hypot(px, pz) - 0.15));
      // [Claude] 公園原本頂面 +0.022 高過柏油 (+0.010)，會蓋住穿過公園的道路；降為 +0.006
      const parkGeo = new THREE.CylinderGeometry(clampedR, clampedR * 1.02, 0.006, Math.max(20, segs));
      parkGeo.translate(px, SURFACE_Y + 0.003, pz);
      parkGeos.push(parkGeo);
    }
    const mergedParkGeo = mergeGeometriesManual(THREE, parkGeos);
    for (let i = 0; i < parkGeos.length; i++) parkGeos[i].dispose();
    const parkMesh = new THREE.Mesh(mergedParkGeo, mats.park);
    parkMesh.receiveShadow = true;
    group.add(parkMesh);
    disposables.push(mergedParkGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(mergedParkGeo, 35));

    if (mapData.plaza) {
      const [plx, plz] = mapData.plaza;
      // [Claude] 廣場同理，降到 +0.008，不蓋過道路與路口
      const plazaGeo = new THREE.CylinderGeometry(1.5, 1.52, 0.008, 36);
      plazaGeo.translate(plx, SURFACE_Y + 0.004, plz);
      const plazaMesh = new THREE.Mesh(plazaGeo, mats.plaza);
      plazaMesh.receiveShadow = true;
      group.add(plazaMesh);
      disposables.push(plazaGeo);
      staticEdgeGeos.push(new THREE.EdgesGeometry(plazaGeo, 35));
    }

    // 三層道路橫斷面：
    // 1. 柏油車道：0 ~ 0.20（總寬 0.40），頂面 SURFACE_Y + 0.010
    // 2. 路緣石：0.20 ~ 0.215（兩側各 0.015），頂面 SURFACE_Y + 0.022
    // 3. 人行道：0.215 ~ 0.33（兩側各 0.115），頂面 SURFACE_Y + 0.020
    const asphaltGeos = [];
    const curbGeos = [];
    const sidewalkGeos = [];
    const roadSnowGeos = [];

    for (let i = 0; i < mapData.edges.length; i++) {
      const nA = mapData.nodes[mapData.edges[i][0]];
      const nB = mapData.nodes[mapData.edges[i][1]];
      const dx = nB[0] - nA[0];
      const dz = nB[1] - nA[1];
      const len = Math.hypot(dx, dz);
      if (len < 0.01) continue;

      const ang = Math.atan2(-dz, dx);
      const midX = (nA[0] + nB[0]) * 0.5;
      const midZ = (nA[1] + nB[1]) * 0.5;

      // 柏油車道（寬 0.40，高 0.010 -> 頂面 SURFACE_Y + 0.010）
      const aspGeo = new THREE.BoxGeometry(len, 0.010, ROAD_SPEC.asphalt);
      aspGeo.rotateY(ang);
      aspGeo.translate(midX, SURFACE_Y + 0.005, midZ);
      asphaltGeos.push(aspGeo);

      // 兩側路緣石／人行道 [Claude] 依 ROAD_SPEC 計算；兩端各退 JUNC_R，不再穿過路口與交會道路的入口
      const sLen = Math.max(0.02, len - JUNC_R * 2);
      for (let side = -1; side <= 1; side += 2) {
        const cGeo = new THREE.BoxGeometry(sLen, 0.022, CURB_W);
        cGeo.translate(0, 0.011, side * (ROAD_SPEC.asphalt * 0.5 + CURB_W * 0.5));
        cGeo.rotateY(ang);
        cGeo.translate(midX, SURFACE_Y, midZ);
        curbGeos.push(cGeo);

        // 兩側人行道（0.215 ~ 0.33 -> 寬 0.115，頂面 SURFACE_Y + 0.020）
        const swGeo = new THREE.BoxGeometry(sLen, 0.020, ROAD_SPEC.sidewalk);
        swGeo.translate(0, 0.010, side * (ROAD_SPEC.asphalt * 0.5 + CURB_W + ROAD_SPEC.sidewalk * 0.5));
        swGeo.rotateY(ang);
        swGeo.translate(midX, SURFACE_Y, midZ);
        sidewalkGeos.push(swGeo);
      }

      const rSnowGeo = new THREE.BoxGeometry(len, 0.004, ROAD_SPEC.asphalt * 0.94);
      rSnowGeo.rotateY(ang);
      rSnowGeo.translate(midX, SURFACE_Y + 0.012, midZ);
      roadSnowGeos.push(rSnowGeo);
    }

    // 路口：柏油圓半徑 0.26，人行道外環半徑 0.38
    for (let i = 0; i < mapData.nodes.length; i++) {
      const [nx, nz] = mapData.nodes[i];

      // [Claude] 路口改為單純柏油圓（半徑 JUNC_R），不再有環形人行道／路緣，避免看起來像圓環
      const jAsphaltGeo = new THREE.CylinderGeometry(JUNC_R, JUNC_R, 0.011, 20);
      jAsphaltGeo.translate(nx, SURFACE_Y + 0.0055, nz);
      asphaltGeos.push(jAsphaltGeo);

      const jSnowGeo = new THREE.CylinderGeometry(JUNC_R * 0.9, JUNC_R * 0.9, 0.004, 18);
      jSnowGeo.translate(nx, SURFACE_Y + 0.0125, nz);
      roadSnowGeos.push(jSnowGeo);
    }

    const mergedSidewalkGeo = mergeGeometriesManual(THREE, sidewalkGeos);
    for (let i = 0; i < sidewalkGeos.length; i++) sidewalkGeos[i].dispose();
    const sidewalkMesh = new THREE.Mesh(mergedSidewalkGeo, mats.sidewalk);
    sidewalkMesh.receiveShadow = true;
    group.add(sidewalkMesh);
    disposables.push(mergedSidewalkGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(mergedSidewalkGeo, 35));

    const mergedCurbGeo = mergeGeometriesManual(THREE, curbGeos);
    for (let i = 0; i < curbGeos.length; i++) curbGeos[i].dispose();
    const curbMesh = new THREE.Mesh(mergedCurbGeo, mats.curbStone);
    curbMesh.receiveShadow = true;
    group.add(curbMesh);
    disposables.push(mergedCurbGeo);

    const mergedAsphaltGeo = mergeGeometriesManual(THREE, asphaltGeos);
    for (let i = 0; i < asphaltGeos.length; i++) asphaltGeos[i].dispose();
    const asphaltMesh = new THREE.Mesh(mergedAsphaltGeo, mats.road);
    asphaltMesh.receiveShadow = true;
    group.add(asphaltMesh);
    disposables.push(mergedAsphaltGeo);
    staticEdgeGeos.push(new THREE.EdgesGeometry(mergedAsphaltGeo, 35));

    // 【修復 0】：水面高於河堤頂面（河堤頂面 SURFACE_Y + 0.022，水面頂面 SURFACE_Y + 0.030）
    const clippedRiverPts = [];
    for (let i = 0; i < mapData.river.length; i++) {
      const [rx, rz] = mapData.river[i];
      const d = Math.hypot(rx, rz);
      if (d <= MAX_RADIUS - 0.16) {
        clippedRiverPts.push([rx, rz]);
      } else if (i > 0) {
        const [px, pz] = mapData.river[i - 1];
        const dPrev = Math.hypot(px, pz);
        const t = Math.max(0, Math.min(1, (MAX_RADIUS - 0.18 - dPrev) / (d - dPrev + 1e-5)));
        clippedRiverPts.push([px + (rx - px) * t, pz + (rz - pz) * t]);
        break;
      }
    }

    const riverBankRibbon = buildRibbonGeometry(
      THREE,
      clippedRiverPts,
      RIVER_WIDTH + 0.14,
      SURFACE_Y + 0.001,
      SURFACE_Y + 0.022
    );
    const riverBankMesh = new THREE.Mesh(riverBankRibbon, mats.riverBank);
    riverBankMesh.receiveShadow = true;
    group.add(riverBankMesh);
    disposables.push(riverBankRibbon);
    staticEdgeGeos.push(new THREE.EdgesGeometry(riverBankRibbon, 32));

    const riverWaterRibbon = buildRibbonGeometry(
      THREE,
      clippedRiverPts,
      RIVER_WIDTH,
      SURFACE_Y + 0.004,
      SURFACE_Y + 0.030
    );
    // [Claude] 城際多瑙河是「不受光照的水波貼圖」(#3a86bd＋淺色波紋，透明度 0.92)，城內原本是受光的純色，
    // 兩者顏色不同。這裡改用同一張水波貼圖與同樣的材質設定，並依沿河距離產生 UV，讓波紋順著河道流動。
    {
      const pos = riverWaterRibbon.getAttribute('position');
      const pts = clippedRiverPts, cum = [0];
      for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const uv = new Float32Array(pos.count * 2);
      for (let v = 0; v < pos.count; v++) {
        const x = pos.getX(v), z = pos.getZ(v);
        let best = 1e9, bs = 0, bo = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const ax = pts[i][0], az = pts[i][1], dx = pts[i + 1][0] - ax, dz = pts[i + 1][1] - az;
          const L2 = dx * dx + dz * dz || 1e-6;
          const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
          const px = ax + dx * t, pz = az + dz * t, d = Math.hypot(x - px, z - pz);
          if (d < best) { best = d; bs = cum[i] + Math.sqrt(L2) * t; bo = ((x - ax) * dz - (z - az) * dx) / Math.sqrt(L2); }
        }
        uv[v * 2] = bs;
        uv[v * 2 + 1] = 0.5 + bo / RIVER_WIDTH;
      }
      riverWaterRibbon.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      const c = document.createElement('canvas'); c.width = 128; c.height = 32;
      const x2 = c.getContext('2d');
      x2.fillStyle = '#3a86bd'; x2.fillRect(0, 0, 128, 32);
      x2.strokeStyle = 'rgba(200,235,255,.65)'; x2.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        x2.beginPath();
        for (let u = 0; u <= 128; u += 4) { const y = 4 + i * 8 + Math.sin(u / 128 * 6.283 * 2 + i) * 2; u ? x2.lineTo(u, y) : x2.moveTo(u, y); }
        x2.stroke();
      }
      const waveTex = new THREE.CanvasTexture(c);
      waveTex.wrapS = waveTex.wrapT = THREE.RepeatWrapping;
      disposables.push(waveTex);
      mats.river.dispose();
      mats.river = new THREE.MeshBasicMaterial({ map: waveTex, transparent: true, opacity: 0.92 });
      mats.river.userData.waveTex = waveTex;
      disposables.push(mats.river);
    }
    const riverWaterMesh = new THREE.Mesh(riverWaterRibbon, mats.river);
    riverWaterMesh.receiveShadow = true;
    group.add(riverWaterMesh);
    disposables.push(riverWaterRibbon);
    staticEdgeGeos.push(new THREE.EdgesGeometry(riverWaterRibbon, 32));

    // 跨河橋樑（高於水面 SURFACE_Y + 0.030）
    const bridgeGeos = [];
    for (let e = 0; e < mapData.edges.length; e++) {
      const nA = mapData.nodes[mapData.edges[e][0]];
      const nB = mapData.nodes[mapData.edges[e][1]];
      for (let r = 0; r < clippedRiverPts.length - 1; r++) {
        const midRx = (clippedRiverPts[r][0] + clippedRiverPts[r + 1][0]) * 0.5;
        const midRz = (clippedRiverPts[r][1] + clippedRiverPts[r + 1][1]) * 0.5;
        if (distToSegmentSq(midRx, midRz, nA[0], nA[1], nB[0], nB[1]) < 0.24 * 0.24) {
          const dx = nB[0] - nA[0];
          const dz = nB[1] - nA[1];
          const ang = Math.atan2(-dz, dx);

          const deckGeo = new THREE.BoxGeometry(0.84, 0.022, ROAD_SPEC.asphalt + 0.06);
          deckGeo.rotateY(ang);
          deckGeo.translate(midRx, SURFACE_Y + 0.042, midRz);
          bridgeGeos.push(deckGeo);

          for (let side = -1; side <= 1; side += 2) {
            const railGeo = new THREE.BoxGeometry(0.84, 0.036, 0.025);
            railGeo.translate(0, 0.028, side * (ROAD_SPEC.asphalt * 0.5 + 0.02));
            railGeo.rotateY(ang);
            railGeo.translate(midRx, SURFACE_Y + 0.042, midRz);
            bridgeGeos.push(railGeo);
          }
          break;
        }
      }
    }
    if (bridgeGeos.length > 0) {
      const mergedBridgeGeo = mergeGeometriesManual(THREE, bridgeGeos);
      for (let i = 0; i < bridgeGeos.length; i++) bridgeGeos[i].dispose();
      const bridgeMesh = new THREE.Mesh(mergedBridgeGeo, mats.warmSand);
      bridgeMesh.castShadow = true;
      bridgeMesh.receiveShadow = true;
      group.add(bridgeMesh);
      disposables.push(mergedBridgeGeo);
      staticEdgeGeos.push(new THREE.EdgesGeometry(mergedBridgeGeo, 25));
    }

    // 積雪層（避開人行道外緣 0.34 與河流）
    const snowShape = new THREE.Shape();
    for (let i = 0; i < basePts.length; i++) {
      const [bx, by] = basePts[i];
      const scaleR = 6.38 / 6.56;
      if (i === 0) snowShape.moveTo(bx * scaleR, by * scaleR);
      else snowShape.lineTo(bx * scaleR, by * scaleR);
    }
    snowShape.closePath();

    for (let i = 0; i < mapData.edges.length; i++) {
      const a = mapData.nodes[mapData.edges[i][0]];
      const b = mapData.nodes[mapData.edges[i][1]];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      if (len < 0.05) continue;
      const nx = (-dz / len) * 0.34;
      const nz = (dx / len) * 0.34;

      const hole = new THREE.Path();
      hole.moveTo(a[0] + nx, a[1] + nz);
      hole.lineTo(b[0] + nx, b[1] + nz);
      hole.lineTo(b[0] - nx, b[1] - nz);
      hole.lineTo(a[0] - nx, a[1] - nz);
      hole.closePath();
      snowShape.holes.push(hole);
    }

    for (let i = 0; i < mapData.nodes.length; i++) {
      const [jx, jz] = mapData.nodes[i];
      const jHole = new THREE.Path();
      const jSegs = 12;
      for (let k = 0; k <= jSegs; k++) {
        const ang = -(k / jSegs) * Math.PI * 2;
        const hx = jx + Math.cos(ang) * 0.39;
        const hz = jz + Math.sin(ang) * 0.39;
        if (k === 0) jHole.moveTo(hx, hz);
        else jHole.lineTo(hx, hz);
      }
      jHole.closePath();
      snowShape.holes.push(jHole);
    }

    if (clippedRiverPts.length >= 2) {
      const rHalfW = (RIVER_WIDTH + 0.16) * 0.5;
      const rLeft = [];
      const rRight = [];
      for (let i = 0; i < clippedRiverPts.length; i++) {
        let tx = 0;
        let tz = 0;
        if (i === 0) {
          tx = clippedRiverPts[1][0] - clippedRiverPts[0][0];
          tz = clippedRiverPts[1][1] - clippedRiverPts[0][1];
        } else if (i === clippedRiverPts.length - 1) {
          tx = clippedRiverPts[i][0] - clippedRiverPts[i - 1][0];
          tz = clippedRiverPts[i][1] - clippedRiverPts[i - 1][1];
        } else {
          tx = clippedRiverPts[i + 1][0] - clippedRiverPts[i - 1][0];
          tz = clippedRiverPts[i + 1][1] - clippedRiverPts[i - 1][1];
        }
        const tLen = Math.hypot(tx, tz) || 1;
        const nx = -tz / tLen;
        const nz = tx / tLen;
        rLeft.push([clippedRiverPts[i][0] + nx * rHalfW, clippedRiverPts[i][1] + nz * rHalfW]);
        rRight.push([clippedRiverPts[i][0] - nx * rHalfW, clippedRiverPts[i][1] - nz * rHalfW]);
      }

      const riverHole = new THREE.Path();
      riverHole.moveTo(rLeft[0][0], rLeft[0][1]);
      for (let i = 1; i < rLeft.length; i++) riverHole.lineTo(rLeft[i][0], rLeft[i][1]);
      for (let i = rRight.length - 1; i >= 0; i--) riverHole.lineTo(rRight[i][0], rRight[i][1]);
      riverHole.closePath();
      snowShape.holes.push(riverHole);
    }

    // [Claude] 道路／路口／河流挖洞彼此重疊，三角化失敗 → 夜雪時出現黑色破洞與三角形殘片。
    // 改為不挖洞，雪面放在 +0.0085：高過公園 (+0.006)、廣場 (+0.008)，低於柏油 (+0.010)、人行道、河岸與水面，
    // 道路與河流自然露在雪面之上（道路積雪另由 roadSnowMesh 處理）。
    snowShape.holes.length = 0;
    const snowGeo = new THREE.ShapeGeometry(snowShape, 16);
    snowGeo.rotateX(-Math.PI / 2);
    snowGeo.translate(0, SURFACE_Y + 0.0085, 0);
    const snowMesh = new THREE.Mesh(snowGeo, mats.snowCover);
    snowMesh.receiveShadow = true;
    group.add(snowMesh);
    disposables.push(snowGeo);

    const mergedRoadSnowGeo = mergeGeometriesManual(THREE, roadSnowGeos);
    for (let i = 0; i < roadSnowGeos.length; i++) roadSnowGeos[i].dispose();
    const roadSnowMesh = new THREE.Mesh(mergedRoadSnowGeo, mats.roadSnow);
    roadSnowMesh.receiveShadow = true;
    group.add(roadSnowMesh);
    disposables.push(mergedRoadSnowGeo);

    const mergedEdges = mergeGeometriesManual(THREE, staticEdgeGeos);
    for (let i = 0; i < staticEdgeGeos.length; i++) staticEdgeGeos[i].dispose();
    group.add(new THREE.LineSegments(mergedEdges, mats.line));
    disposables.push(mergedEdges);

    return { group, snowMesh, roadSnowMesh };
  }
// ============================================================================
  // 【4. 廣場子物件、地標、連排街屋】
  // ============================================================================

  function _trackMesh(disposables, obj) {
    if (!obj || !Array.isArray(disposables)) return;
    obj.traverse((child) => {
      if (child.isMesh) {
        if (child.geometry && typeof child.geometry.dispose === "function") {
          disposables.push(child.geometry);
        }
      }
    });
  }

  function _pickWallMat(mats, idx) {
    // [Claude] 改用第一段實際產生的 8 色立面貼圖材質
    const candidates = WALL_COLOR_KEYS.map((k) => mats[k + 'Facade']).filter(Boolean);
    if (candidates.length > 0) return candidates[Math.abs(idx) % candidates.length];
    return mats.sidewalk || mats.curbStone;
  }

  function _pickRoofMat(mats, idx) {
    // [Claude] 改用第一段實際產生的 5 色屋頂貼圖材質
    const candidates = ROOF_COLOR_KEYS.map((k) => mats[k + 'Mansard']).filter(Boolean);
    if (candidates.length > 0) return candidates[Math.abs(idx) % candidates.length];
    return mats.curbStone || mats.sidewalk;
  }

  function _scaleToAnchor(group, anchor, maxFootprintScale = 0.92) {
    const r = anchor && typeof anchor.r === "number" ? anchor.r : 0.55;
    group.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxXZ = Math.max(size.x || 0.001, size.z || 0.001);
    const targetDiameter = r * 2 * maxFootprintScale;
    // [Claude] 錨點若指定 len（長方形配置），依本地 x 長邊縮放到 len
    const s = anchor && anchor.len ? anchor.len / (size.x || 0.001)
      : Math.min(1.35, Math.max(0.35, targetDiameter / maxXZ));
    group.scale.multiplyScalar(s);

    // [Claude] 主程式會把地標放到錨點 (x, 0.33, z) 並轉 ry，這裡只縮放並讓底部貼齊 y=0
    group.updateMatrixWorld(true);
    const scaledBox = new THREE.Box3().setFromObject(group);
    group.position.y -= scaledBox.min.y;
  }

  function _buildStephansdom(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Stephansdom";
    const wall = _pickWallMat(mats, 0);
    const roof = mats.stephanRoof || mats.roofPatina || _pickRoofMat(mats, 1); // [Claude] 用第一段的彩瓦屋頂
    const accent = mats.gold || mats.curbStone;

    const nave = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.92), wall);
    nave.position.set(0, 0.17, 0);
    nave.castShadow = true;
    nave.receiveShadow = true;
    g.add(nave);

    const steepRoof = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.34, 4), roof);
    steepRoof.rotation.y = Math.PI / 4;
    steepRoof.scale.set(0.95, 1.0, 2.05);
    steepRoof.position.set(0, 0.51, 0);
    steepRoof.castShadow = true;
    g.add(steepRoof);

    // 高聳南塔 (Steffl)
    const stefflBase = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.58, 0.16), wall);
    stefflBase.position.set(0.24, 0.29, -0.14);
    stefflBase.castShadow = true;
    g.add(stefflBase);

    const stefflSpire = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.54, 8), roof);
    stefflSpire.position.set(0.24, 0.85, -0.14);
    stefflSpire.castShadow = true;
    g.add(stefflSpire);

    const finial = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), accent);
    finial.position.set(0.24, 1.13, -0.14);
    g.add(finial);

    // 矮北塔
    const northBase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), wall);
    northBase.position.set(-0.24, 0.22, -0.14);
    g.add(northBase);

    const northDome = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), roof);
    northDome.position.set(-0.24, 0.48, -0.14);
    g.add(northDome);

    return g;
  }

  function _buildHofburg(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Hofburg";
    const wall = mats.wallCream || _pickWallMat(mats, 0);
    const domeMat = mats.roofPatina || mats.roofCopper || _pickRoofMat(mats, 1);
    const goldMat = mats.gold || mats.windowGlow;

    const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.36, 16), wall);
    rotunda.position.set(0, 0.18, 0);
    rotunda.castShadow = true;
    g.add(rotunda);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      domeMat
    );
    dome.scale.set(1, 1.15, 1);
    dome.position.set(0, 0.36, 0);
    g.add(dome);

    const lantern = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), goldMat);
    lantern.position.set(0, 0.64, 0);
    g.add(lantern);

    [-0.44, 0.44].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.28, 0.28), wall);
      wing.position.set(x, 0.14, -0.05);
      wing.castShadow = true;
      wing.receiveShadow = true;
      g.add(wing);

      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.07, 0.3), domeMat);
      wingRoof.position.set(x, 0.31, -0.05);
      g.add(wingRoof);
    });

    return g;
  }

  function _buildSchoenbrunn(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Schoenbrunn";
    const wall = mats.wallSchonbrunnFacade || mats.wallOchre || _pickWallMat(mats, 1); // [Claude] 美泉黃＋窗格立面
    const roof = mats.roofSlate || _pickRoofMat(mats, 2);
    const goldMat = mats.gold || mats.windowGlow;

    const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.26, 0.34), wall);
    mainBlock.position.set(0, 0.13, 0);
    mainBlock.castShadow = true;
    mainBlock.receiveShadow = true;
    g.add(mainBlock);

    const centerPav = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.38), wall);
    centerPav.position.set(0, 0.16, 0.02);
    centerPav.castShadow = true;
    g.add(centerPav);

    const centerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.23, 0.12, 4), roof);
    centerRoof.rotation.y = Math.PI / 4;
    centerRoof.position.set(0, 0.38, 0.02);
    g.add(centerRoof);

    const eagle = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), goldMat);
    eagle.position.set(0, 0.46, 0.02);
    g.add(eagle);

    [-0.38, 0.38].forEach((x) => {
      const sideRoof = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.07, 0.36), roof);
      sideRoof.position.set(x, 0.295, 0);
      g.add(sideRoof);
    });

    return g;
  }

  function _buildRathaus(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Rathaus";
    const wall = mats.wallCream || mats.wallIvory || _pickWallMat(mats, 0);
    const roof = mats.roofSlate || mats.roofDark || _pickRoofMat(mats, 2);
    const goldMat = mats.gold || mats.windowGlow;

    const hall = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.32, 0.48), wall);
    hall.position.set(0, 0.16, 0);
    hall.castShadow = true;
    g.add(hall);

    const hallRoof = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.1, 0.5), roof);
    hallRoof.position.set(0, 0.37, 0);
    g.add(hallRoof);

    // 哥德式中央鐘塔與雙側尖塔
    const mainTower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.62, 0.2), wall);
    mainTower.position.set(0, 0.31, 0.12);
    mainTower.castShadow = true;
    g.add(mainTower);

    const mainSpire = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.38, 4), roof);
    mainSpire.rotation.y = Math.PI / 4;
    mainSpire.position.set(0, 0.81, 0.12);
    g.add(mainSpire);

    const rathausMann = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), goldMat);
    rathausMann.position.set(0, 1.02, 0.12);
    g.add(rathausMann);

    [-0.38, 0.38].forEach((x) => {
      const sideTower = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.48, 0.11), wall);
      sideTower.position.set(x, 0.24, 0.14);
      g.add(sideTower);

      const sideSpire = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), roof);
      sideSpire.rotation.y = Math.PI / 4;
      sideSpire.position.set(x, 0.59, 0.14);
      g.add(sideSpire);
    });

    return g;
  }

  function _buildKunsthistorisches(THREE, mats) {
    const g = new THREE.Group();
    g.name = "KunsthistorischesMuseum";
    const wall = mats.wallSand || mats.wallCream || _pickWallMat(mats, 0);
    const domeMat = mats.roofPatina || mats.roofCopper || _pickRoofMat(mats, 1);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.28, 0.56), wall);
    body.position.set(0, 0.14, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.19, 0.14, 14), wall);
    drum.position.set(0, 0.35, 0);
    g.add(drum);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      domeMat
    );
    dome.position.set(0, 0.42, 0);
    g.add(dome);

    return g;
  }

  function _buildKarlskirche(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Karlskirche";
    const wall = mats.wallCream || mats.wallIvory || _pickWallMat(mats, 0);
    const domeMat = mats.roofPatina || _pickRoofMat(mats, 1);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.28, 0.48), wall);
    body.position.set(0, 0.14, 0);
    body.castShadow = true;
    g.add(body);

    const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.16, 14), wall);
    drum.scale.set(0.9, 1, 1.1);
    drum.position.set(0, 0.36, -0.02);
    g.add(drum);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      domeMat
    );
    dome.scale.set(0.9, 1.3, 1.1);
    dome.position.set(0, 0.44, -0.02);
    g.add(dome);

    // 雙羅馬凱旋柱
    [-0.2, 0.2].forEach((x) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.4, 8), wall);
      col.position.set(x, 0.2, 0.26);
      col.castShadow = true;
      g.add(col);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 8), domeMat);
      cap.position.set(x, 0.42, 0.26);
      g.add(cap);
    });

    return g;
  }

  function _buildBelvedere(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Belvedere";
    const wall = mats.wallCream || mats.wallIvory || _pickWallMat(mats, 0);
    const roof = mats.roofPatina || mats.roofCopper || _pickRoofMat(mats, 1);

    const center = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.3, 0.32), wall);
    center.position.set(0, 0.15, 0);
    center.castShadow = true;
    g.add(center);

    const centerRoof = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.15, 4), roof);
    centerRoof.rotation.y = Math.PI / 4;
    centerRoof.position.set(0, 0.375, 0);
    g.add(centerRoof);

    [-0.36, 0.36].forEach((x) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.24), wall);
      wing.position.set(x, 0.11, 0);
      wing.castShadow = true;
      g.add(wing);

      const wingRoof = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.26), roof);
      wingRoof.position.set(x, 0.26, 0);
      g.add(wingRoof);
    });

    return g;
  }

  function _buildStaatsoper(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Staatsoper";
    const wall = mats.wallOchre || mats.wallSand || _pickWallMat(mats, 1);
    const roof = mats.roofSlate || mats.roofDark || _pickRoofMat(mats, 2);

    const mainHall = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.34, 0.56), wall);
    mainHall.position.set(0, 0.17, -0.05);
    mainHall.castShadow = true;
    g.add(mainHall);

    const arcade = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.22, 0.2), wall);
    arcade.position.set(0, 0.11, 0.26);
    g.add(arcade);

    const mainRoof = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 0.58), roof);
    mainRoof.position.set(0, 0.4, -0.05);
    g.add(mainRoof);

    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 0.18), wall);
    tower.position.set(0, 0.52, -0.08);
    g.add(tower);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.18, 4), roof);
    spire.rotation.y = Math.PI / 4;
    spire.position.set(0, 0.72, -0.08);
    g.add(spire);

    return g;
  }

  function _buildHundertwasserhaus(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Hundertwasserhaus";
    const colors = [
      mats.wallApricot,
      mats.wallPastelBlue,
      mats.wallSage,
      mats.wallOchre,
      mats.wallCream,
    ].filter(Boolean);
    const roof = mats.roofTerracotta || _pickRoofMat(mats, 0);
    const treeMat = mats.foliage || mats.wallSage || _pickRoofMat(mats, 1);

    const blocks = [
      [-0.24, 0.13, 0, 0.3, 0.26, 0.34, 0],
      [0.04, 0.17, 0.02, 0.32, 0.34, 0.36, 1],
      [0.3, 0.14, -0.02, 0.26, 0.28, 0.32, 2],
    ];

    blocks.forEach(([x, y, z, w, h, d, idx]) => {
      const m = colors.length > 0 ? colors[idx % colors.length] : _pickWallMat(mats, idx);
      const part = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      part.position.set(x, y, z);
      part.castShadow = true;
      part.receiveShadow = true;
      g.add(part);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.04, d + 0.02), roof);
      cap.position.set(x, y * 2 + 0.02, z);
      g.add(cap);
    });

    const onionDome = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mats.gold || roof);
    onionDome.scale.set(1, 1.35, 1);
    onionDome.position.set(0.04, 0.44, 0.02);
    g.add(onionDome);

    // 屋頂與陽台綠植
    const bush = new THREE.Mesh(new THREE.DodecahedronGeometry(0.09, 1), treeMat);
    bush.position.set(-0.22, 0.34, 0.12);
    g.add(bush);

    return g;
  }

  function _buildRiesenrad(THREE, mats) {
    const g = new THREE.Group();
    g.name = "Riesenrad";
    const frameMat = mats.curbStone || mats.roofSlate || _pickRoofMat(mats, 2);
    const rimMat = mats.gold || mats.windowGlow || frameMat;
    const cabinMat = mats.viennaRed || mats.wallApricot || // [Claude] 摩天輪車廂為紅色
      mats.wallCream || _pickWallMat(mats, 0);

    const wheelRadius = 0.42;
    const centerY = 0.56;

    // 雙側 A 字支撐架
    [-0.14, 0.14].forEach((zOff) => {
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.68, 6), frameMat);
      leg1.position.set(-0.18, 0.3, zOff);
      leg1.rotation.z = -0.28;
      g.add(leg1);

      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.68, 6), frameMat);
      leg2.position.set(0.18, 0.3, zOff);
      leg2.rotation.z = 0.28;
      g.add(leg2);
    });

    const wheelGroup = new THREE.Group();
    wheelGroup.name = "RiesenradWheel";
    wheelGroup.position.set(0, centerY, 0);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(wheelRadius, 0.016, 8, 24), rimMat);
    wheelGroup.add(rim);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.32, 8), frameMat);
    hub.rotation.x = Math.PI / 2;
    wheelGroup.add(hub);

    const spokes = 12;
    for (let i = 0; i < spokes; i++) {
      const ang = (i / spokes) * Math.PI * 2;
      const spoke = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.006, wheelRadius * 2, 5),
        frameMat
      );
      spoke.rotation.z = ang;
      wheelGroup.add(spoke);

      if (i % 2 === 0) {
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.075, 0.08), cabinMat);
        cabin.position.set(Math.cos(ang) * wheelRadius, Math.sin(ang) * wheelRadius, 0);
        wheelGroup.add(cabin);
      }
    }

    g.add(wheelGroup);
    return g;
  }

  // [Claude] 改寫：MAP_DATA 沒有 roads，改沿 nodes/edges 兩側排街屋；面朝道路；避開彼此
  function _buildTownhouseRowAlongRoad(THREE, mats, mapData, disposables, existingBoxes) {
    const rowGroup = new THREE.Group();
    rowGroup.name = "ViennaTownhouseRows";
    const maxHouses = 48;
    const offset = ROAD_HALF + 0.21; // [Claude] 道路收窄後，街屋貼近人行道外緣（留約 0.05）
    let placedCount = 0;

    for (let e = 0; e < mapData.edges.length && placedCount < maxHouses; e++) {
      const p0 = mapData.nodes[mapData.edges[e][0]];
      const p1 = mapData.nodes[mapData.edges[e][1]];
      const dx = p1[0] - p0[0], dz = p1[1] - p0[1];
      const segLen = Math.hypot(dx, dz);
      if (segLen < 0.9) continue;
      const tx = dx / segLen, tz = dz / segLen, nx = -tz, nz = tx;
      const steps = Math.floor((segLen - 0.5) / 0.36);

      for (let s = 0; s < steps && placedCount < maxHouses; s++) {
        const along = 0.25 + 0.18 + s * 0.36;
        const cx = p0[0] + tx * along, cz = p0[1] + tz * along;
        for (const side of [-1, 1]) {
          if (placedCount >= maxHouses) break;
          const hx = cx + nx * side * offset, hz = cz + nz * side * offset;
          if (!isClearForPlacement(hx, hz, 0.12, mapData, 0)) continue;
          let hit = false;
          for (let k = 0; k < mapData.parks.length; k++) {
            const pk = mapData.parks[k];
            if (Math.hypot(hx - pk[0], hz - pk[1]) < pk[2] + 0.17) { hit = true; break; }
          }
          if (!hit && isInsidePlaza(hx, hz, mapData)) hit = true;
          for (let k = 0; k < existingBoxes.length; k++) {
            const o = existingBoxes[k];
            if (Math.hypot(hx - o.x, hz - o.z) < o.r + 0.17) { hit = true; break; }
          }
          if (hit) continue;

          const w = 0.30 + ((placedCount * 3) % 3) * 0.02;
          const h = 0.26 + ((placedCount * 5) % 4) * 0.05;
          const d = 0.26 + (placedCount % 2) * 0.03;
          const house = new THREE.Group();
          const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), _pickWallMat(mats, placedCount));
          body.position.y = h * 0.5;
          body.castShadow = true;
          body.receiveShadow = true;
          house.add(body);

          const roof = new THREE.Mesh(
            new THREE.ConeGeometry(Math.max(w, d) * 0.74, 0.12, 4),
            _pickRoofMat(mats, placedCount * 2 + 1)
          );
          roof.rotation.y = Math.PI / 4;
          roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
          roof.position.y = h + 0.06;
          roof.castShadow = true;
          house.add(roof);

          house.position.set(hx, SURFACE_Y, hz);
          house.rotation.y = Math.atan2(-side * nx, -side * nz); // 本地 +z（正面）朝向道路
          rowGroup.add(house);
          existingBoxes.push({ x: hx, z: hz, r: 0.17 });
          placedCount++;
        }
      }
    }
    rowGroup.userData.count = placedCount;
    _trackMesh(disposables, rowGroup);
    return rowGroup;
  }

  function buildPlazaAndLandmarks(
    THREE,
    mats,
    segs,
    mapData,
    audioCtxRef,
    disposables,
    interactives,
    animHooks
  ) {
    const group = new THREE.Group();
    group.name = "ViennaPlazaAndLandmarks";
    const landmarksMap = {};
    const occupied = [];

    // [Claude] 廣場鋪面已由【3】buildTerrainAndBase 依 MAP_DATA.plaza 繪製，這裡不再加圓盤（原本放在 (0,0) 會蓋到河道）
    // [Claude] 地標以 LANDMARK_ANCHORS 的中文名稱對應；每次呼叫都新建；不放進平台群組（主程式依錨點擺放）
    const builders = {
      '聖史蒂芬大教堂': () => _buildStephansdom(THREE, mats),
      '霍夫堡皇宮': () => _buildHofburg(THREE, mats),
      '美泉宮': () => _buildSchoenbrunn(THREE, mats),
      '市政廳廣場': () => _buildRathaus(THREE, mats),
      '藝術史博物館 KHM': () => _buildKunsthistorisches(THREE, mats),
      '卡爾教堂': () => _buildKarlskirche(THREE, mats),
      '美景宮 Belvedere': () => _buildBelvedere(THREE, mats),
      '國家歌劇院': () => _buildStaatsoper(THREE, mats),
      '百水公寓': () => _buildHundertwasserhaus(THREE, mats),
      '普拉特與大摩天輪': () => _buildRiesenrad(THREE, mats),
    };

    Object.keys(LANDMARK_ANCHORS).forEach((key) => {
      const anchor = LANDMARK_ANCHORS[key];
      const makeFn = builders[key];
      if (!anchor || !makeFn) return;
      occupied.push({ x: anchor.x, z: anchor.z, r: (anchor.r || 0.55) * 1.05 });
      if (anchor.len) { // [Claude] 長方形地標沿長軸再加佔位，避免街屋／樹／花壓到兩端
        const ux = Math.cos(anchor.ry || 0), uz = -Math.sin(anchor.ry || 0);
        [-0.5, -0.25, 0.25, 0.5].forEach((f) => occupied.push({ x: anchor.x + ux * anchor.len * f, z: anchor.z + uz * anchor.len * f, r: 0.3 }));
      }
      landmarksMap[key] = () => {
        const lmGroup = makeFn();
        lmGroup.name = key;
        _scaleToAnchor(lmGroup, anchor, 0.92);
        _trackMesh(disposables, lmGroup);
        if (key === '普拉特與大摩天輪' && Array.isArray(animHooks)) {
          const wheel = lmGroup.getObjectByName("RiesenradWheel");
          if (wheel) animHooks.push((t, dt) => {
            const d = dt || 0.016, b = wheel.userData.boost || 0; // [Claude] 點擊後加速 5 秒
            wheel.rotation.z -= d * 0.25 * (b > 0 ? 6 : 1);
            if (b > 0) wheel.userData.boost = Math.max(0, b - d);
          });
        }
        return lmGroup;
      };
    });

    const townhouses = _buildTownhouseRowAlongRoad(THREE, mats, mapData, disposables, occupied);
    group.add(townhouses);

    return {
      group,
      landmarks: landmarksMap,
      occupied,
    };
  }
  // ============================================================================
  // 【4b. 中央廣場子物件與音效】
  // [Claude] Gemini v5 的【4】沒有廣場擺設、也沒有互動彩蛋；此段移植自 Gemini v4
  // （莫札特像、高音譜號花圃、咖啡座、香腸攤、街頭樂手、噴泉、鴿群、長椅、街燈），
  // 只調整：廣場鋪面高度、音訊參照、回傳值，其餘造型與互動維持 v4 原樣。
  // ============================================================================
  function buildViennaPlaza(THREE, mats, mapData, audioCtxRef, disposables, interactives, animHooks) {
    const group = new THREE.Group();
    group.name = "ViennaPlazaProps";
    const staticEdgeGeos = [];
    const nightLamps = [];

    let activeStopFn = null;
    function stopPreviousAudio() {
      if (activeStopFn) {
        try { activeStopFn(); } catch (e) {}
        activeStopFn = null;
      }
    }

    function playMelody(notes, tempoSec, waveType) {
      const audio = audioCtxRef();
      if (!audio || !audio.ctx || !audio.out) return;
      stopPreviousAudio();

      const ctx = audio.ctx;
      const now = ctx.currentTime;
      const masterNoteGain = ctx.createGain();
      masterNoteGain.gain.setValueAtTime(0.001, now);
      masterNoteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      masterNoteGain.connect(audio.out);

      const oscillators = [];
      let cursor = now + 0.02;
      for (let i = 0; i < notes.length; i++) {
        const [freq, beats] = notes[i];
        const dur = beats * tempoSec;
        if (freq > 0) {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = waveType || 'triangle';
          osc.frequency.setValueAtTime(freq, cursor);

          env.gain.setValueAtTime(0.0001, cursor);
          env.gain.exponentialRampToValueAtTime(0.9, cursor + 0.02);
          env.gain.exponentialRampToValueAtTime(0.0001, cursor + Math.max(0.04, dur * 0.92));

          osc.connect(env);
          env.connect(masterNoteGain);
          osc.start(cursor);
          osc.stop(cursor + dur);
          oscillators.push(osc);
        }
        cursor += dur;
      }

      activeStopFn = function () {
        const tNow = ctx.currentTime;
        masterNoteGain.gain.cancelScheduledValues(tNow);
        masterNoteGain.gain.setValueAtTime(Math.max(0.0001, masterNoteGain.gain.value), tNow);
        masterNoteGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 0.14);
        setTimeout(() => {
          oscillators.forEach((o) => { try { o.stop(); } catch (e) {} });
          try { masterNoteGain.disconnect(); } catch (e) {}
        }, 170);
      };
    }

    function playBellOrHorse(kind) {
      const audio = audioCtxRef();
      if (!audio || !audio.ctx || !audio.out) return;
      stopPreviousAudio();
      const ctx = audio.ctx;
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.2, now);
      g.connect(audio.out);

      if (kind === 'bell') {
        [0, 0.14].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const env = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 0 ? 1174.66 : 1396.91, now + offset);
          env.gain.setValueAtTime(0.001, now + offset);
          env.gain.exponentialRampToValueAtTime(0.8, now + offset + 0.01);
          env.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.35);
          osc.connect(env);
          env.connect(g);
          osc.start(now + offset);
          osc.stop(now + offset + 0.38);
        });
      } else {
        const osc = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const env = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.55);

        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(24, now);
        lfoGain.gain.setValueAtTime(35, now);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        env.gain.setValueAtTime(0.001, now);
        env.gain.exponentialRampToValueAtTime(0.45, now + 0.05);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.58);

        osc.connect(env);
        env.connect(g);
        osc.start(now);
        lfo.start(now);
        osc.stop(now + 0.6);
        lfo.stop(now + 0.6);
      }
    }

    const [plx, plz] = mapData.plaza;
    const plazaGroup = new THREE.Group();
    plazaGroup.position.set(plx, SURFACE_Y + 0.008, plz); // [Claude] v5 廣場鋪面頂在 +0.008
    group.add(plazaGroup);

    let mozartSpotTimer = 0;
    let spotLight = null;
    let beamMat = null;

    function buildMozart() {
      const mGroup = new THREE.Group();
      mGroup.position.set(-0.22, 0, -0.32);

      const sandGeos = [];
      const creamGeos = [];
      const whiteGeos = [];
      const woodGeos = [];
      const goldGeos = [];

      const t1 = new THREE.BoxGeometry(0.62, 0.08, 0.5);
      t1.translate(0, 0.04, 0);
      sandGeos.push(t1);

      const t2 = new THREE.BoxGeometry(0.48, 0.09, 0.38);
      t2.translate(0, 0.125, 0);
      creamGeos.push(t2);

      const t3 = new THREE.BoxGeometry(0.36, 0.12, 0.3);
      t3.translate(0, 0.23, 0);
      sandGeos.push(t3);

      const coat = new THREE.CylinderGeometry(0.07, 0.115, 0.34, 12);
      coat.translate(0, 0.45, 0);
      whiteGeos.push(coat);

      const head = new THREE.SphereGeometry(0.06, 12, 12);
      head.translate(0, 0.67, 0);
      whiteGeos.push(head);

      const wig = new THREE.TorusGeometry(0.058, 0.023, 8, 14);
      wig.rotateX(Math.PI / 2);
      wig.translate(0, 0.66, -0.015);
      whiteGeos.push(wig);

      const violin = new THREE.BoxGeometry(0.052, 0.026, 0.14);
      violin.rotateZ(0.25);
      violin.translate(-0.09, 0.58, 0.05);
      woodGeos.push(violin);

      const baton = new THREE.CylinderGeometry(0.005, 0.008, 0.19, 6);
      baton.rotateZ(-0.75);
      baton.translate(0.11, 0.64, 0.07);
      goldGeos.push(baton);

      const archCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.36, 0.08, -0.24),
        new THREE.Vector3(-0.34, 0.74, -0.24),
        new THREE.Vector3(-0.17, 1.05, -0.24),
        new THREE.Vector3(0.0, 1.11, -0.24),
        new THREE.Vector3(0.17, 1.05, -0.24),
        new THREE.Vector3(0.34, 0.74, -0.24),
        new THREE.Vector3(0.36, 0.08, -0.24)
      ]);
      const arch = new THREE.TubeGeometry(archCurve, 24, 0.038, 8, false);
      sandGeos.push(arch);

      const pairs = [
        [sandGeos, mats.warmSand],
        [creamGeos, mats.creamWall],
        [whiteGeos, mats.white],
        [woodGeos, mats.darkWood],
        [goldGeos, mats.gold]
      ];
      for (let i = 0; i < pairs.length; i++) {
        const [list, mat] = pairs[i];
        if (!list.length) continue;
        const merged = mergeGeometriesManual(THREE, list);
        list.forEach((g) => g.dispose());
        mGroup.add(new THREE.Mesh(merged, mat));
        disposables.push(merged);
        staticEdgeGeos.push(new THREE.EdgesGeometry(merged, 25));
      }

      spotLight = new THREE.PointLight(0xffe082, 0.0, 2.5);
      spotLight.position.set(0.3, 0.95, 0.4);
      mGroup.add(spotLight);

      const beamGeo = new THREE.ConeGeometry(0.32, 0.85, 16, 1, true);
      beamGeo.translate(0.14, 0.6, 0.18);
      beamGeo.rotateZ(-0.22);
      beamMat = new THREE.MeshBasicMaterial({
        color: 0xffe082,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      mGroup.add(new THREE.Mesh(beamGeo, beamMat));
      disposables.push(beamGeo, beamMat);

      interactives.push({
        object: mGroup,
        name: '莫札特紀念像',
        hint: '點擊：雕像打燈並奏出《小夜曲》開頭',
        onClick: function () {
          mozartSpotTimer = 4.5;
          playMelody(
            [
              [392.0, 1.5], [293.66, 0.5], [392.0, 2.0],
              [293.66, 1.5], [392.0, 0.5], [587.33, 1.0], [493.88, 1.0]
            ],
            0.26,
            'triangle'
          );
        }
      });

      return mGroup;
    }

    function buildClefFlowerBed() {
      const cGroup = new THREE.Group();
      cGroup.position.set(-0.92, 0, 0.35);

      const bedGeo = new THREE.CylinderGeometry(0.42, 0.45, 0.04, 24);
      bedGeo.translate(0, 0.02, 0);
      cGroup.add(new THREE.Mesh(bedGeo, mats.paleSage));
      disposables.push(bedGeo);
      staticEdgeGeos.push(new THREE.EdgesGeometry(bedGeo, 30));

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.02, 0.05, 0.24),
        new THREE.Vector3(-0.04, 0.07, 0.16),
        new THREE.Vector3(-0.11, 0.10, 0.06),
        new THREE.Vector3(-0.09, 0.15, -0.05),
        new THREE.Vector3(0.02, 0.18, -0.10),
        new THREE.Vector3(0.12, 0.15, -0.03),
        new THREE.Vector3(0.11, 0.08, 0.08),
        new THREE.Vector3(-0.02, 0.06, 0.12),
        new THREE.Vector3(-0.03, 0.13, -0.02),
        new THREE.Vector3(-0.01, 0.22, -0.16),
        new THREE.Vector3(0.04, 0.27, -0.22),
        new THREE.Vector3(0.07, 0.23, -0.17),
        new THREE.Vector3(0.02, 0.12, -0.04),
        new THREE.Vector3(0.00, 0.04, 0.25)
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.022, 8, false);
      cGroup.add(new THREE.Mesh(tubeGeo, mats.viennaRed));
      disposables.push(tubeGeo);
      staticEdgeGeos.push(new THREE.EdgesGeometry(tubeGeo, 28));

      const redFlowers = [];
      const whiteFlowers = [];
      for (let f = 0; f < 16; f++) {
        const pt = curve.getPoint(f / 15);
        const fg = new THREE.SphereGeometry(0.02, 6, 6);
        fg.translate(pt.x, pt.y + 0.022, pt.z);
        if (f % 2 === 0) redFlowers.push(fg);
        else whiteFlowers.push(fg);
      }
      const mRed = mergeGeometriesManual(THREE, redFlowers);
      const mWhite = mergeGeometriesManual(THREE, whiteFlowers);
      redFlowers.forEach((g) => g.dispose());
      whiteFlowers.forEach((g) => g.dispose());
      cGroup.add(new THREE.Mesh(mRed, mats.viennaRed), new THREE.Mesh(mWhite, mats.white));
      disposables.push(mRed, mWhite);

      return cGroup;
    }

    function buildCafe() {
      const fGroup = new THREE.Group();
      fGroup.position.set(-0.05, 0, 0.88);

      const whiteGeos = [];
      const woodGeos = [];
      const peachGeos = [];
      const redGeos = [];
      const creamGeos = [];

      const offsets = [
        [-0.36, -0.05, true, true],
        [0.02, 0.08, false, false],
        [0.38, -0.06, true, false]
      ];

      for (let c = 0; c < offsets.length; c++) {
        const [cx, cz, hasParasol, isRedPara] = offsets[c];
        const top = new THREE.CylinderGeometry(0.11, 0.11, 0.018, 12);
        top.translate(cx, 0.135, cz);
        whiteGeos.push(top);

        const leg = new THREE.CylinderGeometry(0.016, 0.024, 0.13, 8);
        leg.translate(cx, 0.065, cz);
        woodGeos.push(leg);

        const cake = new THREE.CylinderGeometry(0.028, 0.032, 0.022, 8);
        cake.translate(cx + 0.02, 0.155, cz + 0.01);
        peachGeos.push(cake);

        for (let side = -1; side <= 1; side += 2) {
          const seat = new THREE.CylinderGeometry(0.045, 0.04, 0.015, 8);
          seat.translate(cx, 0.075, cz + side * 0.14);
          const back = new THREE.BoxGeometry(0.08, 0.07, 0.014);
          back.translate(cx, 0.115, cz + side * 0.18);
          woodGeos.push(seat, back);
        }

        if (hasParasol) {
          const pole = new THREE.CylinderGeometry(0.009, 0.009, 0.25, 6);
          pole.translate(cx, 0.25, cz);
          creamGeos.push(pole);

          const para = new THREE.ConeGeometry(0.24, 0.1, 10);
          para.translate(cx, 0.37, cz);
          if (isRedPara) redGeos.push(para);
          else whiteGeos.push(para);
        }
      }

      const rack = new THREE.BoxGeometry(0.14, 0.22, 0.06);
      rack.translate(-0.56, 0.11, 0.16);
      woodGeos.push(rack);

      const groups = [
        [whiteGeos, mats.white],
        [woodGeos, mats.darkWood],
        [peachGeos, mats.softPeach],
        [redGeos, mats.viennaRed],
        [creamGeos, mats.creamWall]
      ];
      for (let i = 0; i < groups.length; i++) {
        const [list, mat] = groups[i];
        if (!list.length) continue;
        const merged = mergeGeometriesManual(THREE, list);
        list.forEach((g) => g.dispose());
        fGroup.add(new THREE.Mesh(merged, mat));
        disposables.push(merged);
        staticEdgeGeos.push(new THREE.EdgesGeometry(merged, 25));
      }

      return fGroup;
    }

    function buildWurstStand() {
      const wGroup = new THREE.Group();
      wGroup.position.set(0.88, 0, -0.18);

      const stall = new THREE.BoxGeometry(0.36, 0.3, 0.28);
      stall.translate(0, 0.15, 0);
      const canopy = new THREE.BoxGeometry(0.42, 0.05, 0.34);
      canopy.translate(0, 0.32, 0);
      const sign = new THREE.BoxGeometry(0.34, 0.07, 0.03);
      sign.translate(0, 0.38, 0.15);
      const lamp = new THREE.SphereGeometry(0.025, 8, 8);
      lamp.translate(0, 0.27, 0.15);

      const sageGeos = [];
      const peachGeos = [];
      const headGeos = [];
      for (let g = 0; g < 3; g++) {
        const body = new THREE.CylinderGeometry(0.045, 0.06, 0.22, 8);
        body.translate(-0.06 - g * 0.13, 0.15, 0.24 + g * 0.04);
        const head = new THREE.SphereGeometry(0.045, 8, 8);
        head.translate(-0.06 - g * 0.13, 0.31, 0.24 + g * 0.04);
        headGeos.push(head);
        if (g % 2 === 0) sageGeos.push(body);
        else peachGeos.push(body);
      }

      const mStall = mergeGeometriesManual(THREE, [stall]);
      const mCanopy = mergeGeometriesManual(THREE, [canopy]);
      const mSign = mergeGeometriesManual(THREE, [sign]);
      const mLamp = mergeGeometriesManual(THREE, [lamp]);
      const mSage = mergeGeometriesManual(THREE, sageGeos);
      const mPeach = mergeGeometriesManual(THREE, peachGeos);
      const mHeads = mergeGeometriesManual(THREE, headGeos);

      [stall, canopy, sign, lamp, ...sageGeos, ...peachGeos, ...headGeos].forEach((x) => x.dispose());
      wGroup.add(
        new THREE.Mesh(mStall, mats.viennaRed),
        new THREE.Mesh(mCanopy, mats.white),
        new THREE.Mesh(mSign, mats.gold),
        new THREE.Mesh(mLamp, mats.windowGlow),
        new THREE.Mesh(mSage, mats.paleSage),
        new THREE.Mesh(mPeach, mats.softPeach),
        new THREE.Mesh(mHeads, mats.creamWall)
      );
      disposables.push(mStall, mCanopy, mSign, mLamp, mSage, mPeach, mHeads);
      staticEdgeGeos.push(new THREE.EdgesGeometry(mStall, 25), new THREE.EdgesGeometry(mCanopy, 25));

      return wGroup;
    }

    let musicianBoostTimer = 0;
    let bowMesh = null;

    function buildMusicians() {
      const muGroup = new THREE.Group();
      muGroup.position.set(0.68, 0, 0.56);

      const darkGeos = [];
      const skinGeos = [];
      const wigGeos = [];
      const sageGeos = [];
      const sandGeos = [];

      const offsets = [
        [-0.18, 0.04],
        [0.0, -0.02],
        [0.18, 0.05]
      ];
      for (let m = 0; m < offsets.length; m++) {
        const [mx, mz] = offsets[m];
        const body = new THREE.CylinderGeometry(0.05, 0.07, 0.22, 8);
        body.translate(mx, 0.14, mz);
        const head = new THREE.SphereGeometry(0.045, 8, 8);
        head.translate(mx, 0.28, mz);
        const wig = new THREE.TorusGeometry(0.042, 0.016, 6, 10);
        wig.rotateX(Math.PI / 2);
        wig.translate(mx, 0.275, mz - 0.01);
        darkGeos.push(body);
        skinGeos.push(head);
        wigGeos.push(wig);
      }

      const standPole = new THREE.CylinderGeometry(0.008, 0.01, 0.26, 6);
      standPole.translate(0.0, 0.13, 0.14);
      const standDesk = new THREE.BoxGeometry(0.11, 0.07, 0.012);
      standDesk.rotateX(-0.4);
      standDesk.translate(0.0, 0.26, 0.15);
      darkGeos.push(standPole);
      wigGeos.push(standDesk);

      for (let l = 0; l < 3; l++) {
        const lx = -0.22 + l * 0.22;
        const lz = 0.28 + (l % 2) * 0.06;
        const lBody = new THREE.CylinderGeometry(0.045, 0.06, 0.22, 8);
        lBody.translate(lx, 0.14, lz);
        const lHead = new THREE.SphereGeometry(0.044, 8, 8);
        lHead.translate(lx, 0.28, lz);
        skinGeos.push(lHead);
        if (l === 1) sandGeos.push(lBody);
        else sageGeos.push(lBody);
      }

      const pairs = [
        [darkGeos, mats.darkWood],
        [skinGeos, mats.creamWall],
        [wigGeos, mats.white],
        [sageGeos, mats.paleSage],
        [sandGeos, mats.warmSand]
      ];
      for (let i = 0; i < pairs.length; i++) {
        const [list, mat] = pairs[i];
        if (!list.length) continue;
        const merged = mergeGeometriesManual(THREE, list);
        list.forEach((g) => g.dispose());
        muGroup.add(new THREE.Mesh(merged, mat));
        disposables.push(merged);
      }

      const bowGeo = new THREE.BoxGeometry(0.014, 0.014, 0.18);
      bowGeo.translate(-0.12, 0.21, 0.09);
      bowMesh = new THREE.Mesh(bowGeo, mats.gold);
      muGroup.add(bowMesh);
      disposables.push(bowGeo);

      interactives.push({
        object: muGroup,
        name: '街頭樂手',
        hint: '點擊：演奏《小星星變奏曲》',
        onClick: function () {
          musicianBoostTimer = 4.0;
          playMelody(
            [
              [261.63, 1], [261.63, 1], [392.0, 1], [392.0, 1],
              [440.0, 1], [440.0, 1], [392.0, 2],
              [349.23, 1], [349.23, 1], [329.63, 1], [329.63, 1],
              [293.66, 1], [293.66, 1], [261.63, 2]
            ],
            0.22,
            'sine'
          );
        }
      });

      return muGroup;
    }

    const waterDrops = [];
    function buildFountain() {
      const fnGroup = new THREE.Group();
      fnGroup.position.set(0.38, 0, -0.78);

      const basin = new THREE.CylinderGeometry(0.28, 0.31, 0.09, 16);
      basin.translate(0, 0.045, 0);
      const spout = new THREE.CylinderGeometry(0.035, 0.06, 0.2, 10);
      spout.translate(0, 0.14, 0);

      const mBasin = mergeGeometriesManual(THREE, [basin]);
      const mSpout = mergeGeometriesManual(THREE, [spout]);
      basin.dispose();
      spout.dispose();
      fnGroup.add(new THREE.Mesh(mBasin, mats.warmSand), new THREE.Mesh(mSpout, mats.creamWall));
      disposables.push(mBasin, mSpout);
      staticEdgeGeos.push(new THREE.EdgesGeometry(mBasin, 25));

      const dropGeo = new THREE.SphereGeometry(0.02, 6, 6);
      disposables.push(dropGeo);
      for (let i = 0; i < 8; i++) {
        const dm = new THREE.Mesh(dropGeo, mats.water);
        fnGroup.add(dm);
        waterDrops.push({ mesh: dm, phase: (i / 8) * Math.PI * 2 });
      }

      return fnGroup;
    }

    const pigeons = [];
    function buildPigeons() {
      const pGroup = new THREE.Group();
      const bodyGeo = new THREE.SphereGeometry(0.032, 8, 8);
      bodyGeo.scale(1.2, 0.8, 0.9);
      disposables.push(bodyGeo);

      const perchSpots = [
        new THREE.Vector3(-0.22, 0.76, -0.31),
        new THREE.Vector3(-0.33, 0.64, -0.29),
        new THREE.Vector3(-0.11, 0.63, -0.29)
      ];

      for (let i = 0; i < 6; i++) {
        const pg = new THREE.Group();
        pg.add(new THREE.Mesh(bodyGeo, mats.white));
        const baseAngle = (i / 6) * Math.PI * 2;
        const startX = -0.35 + Math.cos(baseAngle) * 0.25;
        const startZ = 0.35 + Math.sin(baseAngle) * 0.25;
        pg.position.set(startX, 0.025, startZ);
        pGroup.add(pg);

        pigeons.push({
          group: pg,
          homePos: new THREE.Vector3(startX, 0.025, startZ),
          perchPos: i < 3 ? perchSpots[i] : new THREE.Vector3(startX, 0.025, startZ),
          angle: baseAngle,
          flyTimer: 0
        });
      }

      const hitGroup = new THREE.Group();
      hitGroup.position.set(-0.35, 0.06, 0.35);
      const hitGeo = new THREE.BoxGeometry(0.55, 0.14, 0.55);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      hitGroup.add(new THREE.Mesh(hitGeo, hitMat));
      pGroup.add(hitGroup);
      disposables.push(hitGeo, hitMat);

      interactives.push({
        object: hitGroup,
        name: '廣場鴿群',
        hint: '點擊：鴿群振翅飛起，3 隻停靠雕像頭頂與肩膀',
        onClick: function () {
          for (let i = 0; i < pigeons.length; i++) {
            pigeons[i].flyTimer = 3.8;
          }
        }
      });

      return pGroup;
    }

    function buildBenches() {
      const bGroup = new THREE.Group();
      const woodGeos = [];
      const slateGeos = [];
      const coords = [
        [-0.95, -0.45, 0.4],
        [0.98, 0.22, -0.5]
      ];
      for (let b = 0; b < coords.length; b++) {
        const [bx, bz, ry] = coords[b];
        const cos = Math.cos(ry);
        const sin = Math.sin(ry);
        function placePart(geo, lx, ly, lz) {
          geo.rotateY(ry);
          geo.translate(bx + lx * cos + lz * sin, ly, bz - lx * sin + lz * cos);
          return geo;
        }
        woodGeos.push(placePart(new THREE.BoxGeometry(0.34, 0.025, 0.11), 0, 0.085, 0));
        woodGeos.push(placePart(new THREE.BoxGeometry(0.34, 0.08, 0.02), 0, 0.135, -0.045));
        slateGeos.push(placePart(new THREE.BoxGeometry(0.03, 0.08, 0.1), -0.13, 0.04, 0));
        slateGeos.push(placePart(new THREE.BoxGeometry(0.03, 0.08, 0.1), 0.13, 0.04, 0));
      }
      const mWood = mergeGeometriesManual(THREE, woodGeos);
      const mSlate = mergeGeometriesManual(THREE, slateGeos);
      woodGeos.forEach((g) => g.dispose());
      slateGeos.forEach((g) => g.dispose());
      bGroup.add(new THREE.Mesh(mWood, mats.darkWood), new THREE.Mesh(mSlate, mats.roofSlate));
      disposables.push(mWood, mSlate);
      staticEdgeGeos.push(new THREE.EdgesGeometry(mWood, 25));
      return bGroup;
    }

    function buildStreetLamps() {
      const lGroup = new THREE.Group();
      const poleGeos = [];
      const positions = [
        [-1.12, -0.82],
        [1.15, -0.82],
        [-1.15, 0.92],
        [1.12, 0.92]
      ];
      const bulbGeo = new THREE.SphereGeometry(0.035, 8, 8);
      disposables.push(bulbGeo);

      for (let l = 0; l < positions.length; l++) {
        const [lx, lz] = positions[l];
        const pole = new THREE.CylinderGeometry(0.012, 0.018, 0.56, 8);
        pole.translate(lx, 0.28, lz);
        poleGeos.push(pole);

        const bulb = new THREE.Mesh(bulbGeo, mats.windowGlow);
        bulb.position.set(lx, 0.58, lz);
        lGroup.add(bulb);
        nightLamps.push(bulb);
      }

      const mPoles = mergeGeometriesManual(THREE, poleGeos);
      poleGeos.forEach((g) => g.dispose());
      lGroup.add(new THREE.Mesh(mPoles, mats.roofSlate));
      disposables.push(mPoles);
      staticEdgeGeos.push(new THREE.EdgesGeometry(mPoles, 25));
      return lGroup;
    }

    plazaGroup.add(
      buildMozart(),
      buildClefFlowerBed(),
      buildCafe(),
      buildWurstStand(),
      buildMusicians(),
      buildFountain(),
      buildPigeons(),
      buildBenches(),
      buildStreetLamps()
    );

    // [Claude] v4 把各子物件「區域座標」的描邊合併後放在平台原點，描邊會跑到城中心（黑色線框拱門）。
    // 改為直接替每個靜態網格加上自己的描邊子物件，座標隨物件走。
    for (let i = 0; i < staticEdgeGeos.length; i++) staticEdgeGeos[i].dispose();
    const edgeTargets = [];
    group.traverse((o) => {
      if (o.isMesh && o.geometry && o.material && o.material.visible && !o.material.transparent && o.material !== mats.windowGlow) edgeTargets.push(o);
    });
    edgeTargets.forEach((o) => {
      const eg = new THREE.EdgesGeometry(o.geometry, 25);
      o.add(new THREE.LineSegments(eg, mats.line));
      disposables.push(eg);
    });

    animHooks.push(function (t, dt, reducedMotion) {
      if (mozartSpotTimer > 0) {
        mozartSpotTimer = Math.max(0, mozartSpotTimer - dt);
        const fade = Math.min(1, mozartSpotTimer * 1.5);
        if (spotLight) spotLight.intensity = 1.8 * fade;
        if (beamMat) beamMat.opacity = 0.22 * fade;
      } else {
        if (spotLight) spotLight.intensity = 0;
        if (beamMat) beamMat.opacity = 0;
      }

      const bowSpeed = musicianBoostTimer > 0 ? 14 : 2.5;
      if (musicianBoostTimer > 0) musicianBoostTimer = Math.max(0, musicianBoostTimer - dt);
      if (bowMesh) {
        bowMesh.position.z = 0.09 + Math.sin(t * bowSpeed) * (reducedMotion ? 0.01 : 0.045);
      }

      for (let i = 0; i < waterDrops.length; i++) {
        const d = waterDrops[i];
        const p = (t * 1.6 + d.phase) % 1;
        const rad = 0.04 + p * 0.16;
        d.mesh.position.set(
          Math.cos(d.phase) * rad,
          0.19 + p * 0.14 - p * p * 0.2,
          Math.sin(d.phase) * rad
        );
      }

      for (let i = 0; i < pigeons.length; i++) {
        const pgItem = pigeons[i];
        if (pgItem.flyTimer > 0) {
          pgItem.flyTimer = Math.max(0, pgItem.flyTimer - dt);
          const orbitAng = t * 3.2 + pgItem.angle;
          const rOrbit = 0.45 + (i % 3) * 0.14;
          pgItem.group.position.set(
            -0.22 + Math.cos(orbitAng) * rOrbit,
            0.46 + Math.sin(t * 5 + i) * 0.12,
            -0.32 + Math.sin(orbitAng) * rOrbit
          );
          pgItem.group.rotation.y = -orbitAng;
          pgItem.group.scale.y = 0.8 + Math.abs(Math.sin(t * 18 + i)) * 0.45;
        } else {
          pgItem.group.scale.y = 1.0;
          pgItem.group.position.lerp(i < 3 ? pgItem.perchPos : pgItem.homePos, Math.min(1, dt * 6));
        }
      }
    });

    return {
      group,
      nightLamps,
      playMelody,
      triggerBell: () => playBellOrHorse('bell'),
      triggerHorse: () => playBellOrHorse('horse')
    };
  }

// ============================================================================
  // 【5. 工廠與動態物件 (Factories & Animated Elements)】
  // ============================================================================

  function buildFactories(THREE, mats, segs, disposables, interactives, plazaHooks) {
    const s = Math.max(8, segs || 16);

    function _track(obj) {
      if (!obj || !Array.isArray(disposables)) return;
      obj.traverse((child) => {
        if (child.isMesh && child.geometry && typeof child.geometry.dispose === "function") {
          disposables.push(child.geometry);
        }
      });
    }

    // [Claude] 依主程式傳入的色碼建單色材質（同色共用），並納入 disposables
    const _colCache = {};
    function _col(hex, extra) {
      const key = String(hex) + (extra ? JSON.stringify(extra) : '');
      if (!_colCache[key]) {
        _colCache[key] = new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: 0.7, metalness: 0.05 }, extra || {}));
        disposables.push(_colCache[key]);
      }
      return _colCache[key];
    }
    function _hexOf(v, dflt) {
      if (typeof v === 'number') return v;
      if (v && typeof v.coatColor === 'number') return v.coatColor;
      if (v && typeof v.color === 'number') return v.color;
      return dflt;
    }

    function _firstMat(...keys) {
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (k && mats && mats[k]) return mats[k];
      }
      return mats && (mats.windowGlow || mats.line || mats.roadSnow || mats.snowCover);
    }

    // [Claude] 主程式以「本地 +x 為車頭」擺放車輛（rotation.y = 行進方向 − 90°），
    // Gemini 的車輛車頭朝 +z，直接用會變成橫著開。外包一層並轉 90°，讓車頭改朝 +x。
    function _fwdX(inner) {
      const outer = new THREE.Group();
      outer.name = inner.name + "_fwdX";
      inner.rotation.y = Math.PI / 2;
      outer.add(inner);
      return outer;
    }

    let _treeN = 0;
    function makeTree(scale = 1) {
      if (typeof scale !== 'number') scale = (scale && scale.scale) || 1;
      const group = new THREE.Group();
      group.name = "ViennaTree";

      // [Claude] 原本退回 roadSnow/snowCover → 白色樹；改深木色樹幹＋綠色樹冠（三種綠交替）
      const trunkMat = mats.darkWood;
      const foliageMat = [mats.park, mats.parkWarm, mats.parkAlt][(Math.round(scale * 10) + _treeN++) % 3];

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.022 * scale, 0.032 * scale, 0.14 * scale, Math.max(6, Math.floor(s / 2))),
        trunkMat
      );
      trunk.position.y = 0.07 * scale;
      trunk.castShadow = true;
      group.add(trunk);

      const crown = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.11 * scale, 1),
        foliageMat
      );
      crown.position.y = 0.2 * scale;
      crown.castShadow = true;
      group.add(crown);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);
      return group;
    }

    function makeCar(colorKey) {
      const group = new THREE.Group();
      group.name = "ViennaCar";

      // [Claude] 主程式傳入色碼（0xe8574a 等），改用單色材質；車輪改深色
      const bodyMat = _col(_hexOf(colorKey, 0xb83535));
      const roofMat = mats.white;
      const winMat = _col(0x2a3a4a, { roughness: 0.3 });

      const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.052, 0.24), bodyMat);
      chassis.position.y = 0.044;
      chassis.castShadow = true;
      group.add(chassis);

      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.042, 0.13), roofMat);
      cabin.position.set(0, 0.088, -0.01);
      group.add(cabin);

      const win = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.022, 0.11), winMat);
      win.position.set(0, 0.088, -0.01);
      group.add(win);

      [
        [-0.062, 0.024, 0.075],
        [0.062, 0.024, 0.075],
        [-0.062, 0.024, -0.075],
        [0.062, 0.024, -0.075],
      ].forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.024, 0.024, 0.018, 8),
          mats.horseDark
        );
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, wy, wz);
        group.add(wheel);
      });

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);
      return _fwdX(group);
    }

    function makeBus() {
      const group = new THREE.Group();
      group.name = "ViennaBus";

      // [Claude] 改單色：白車身、維也納紅條紋、深色車窗
      const bodyMat = mats.white;
      const stripeMat = mats.viennaRed;
      const winMat = _col(0x2a3a4a, { roughness: 0.3 });

      const hull = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.11, 0.42), bodyMat);
      hull.position.y = 0.075;
      hull.castShadow = true;
      group.add(hull);

      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.154, 0.024, 0.422), stripeMat);
      stripe.position.y = 0.05;
      group.add(stripe);

      const win = new THREE.Mesh(new THREE.BoxGeometry(0.156, 0.035, 0.34), winMat);
      win.position.y = 0.095;
      group.add(win);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);
      return _fwdX(group);
    }

    function makeTram() {
      const group = new THREE.Group();
      group.name = "ViennaTram";

      // [Claude] 維也納紅白電車，改單色材質
      const redMat = mats.viennaRed;
      const whiteMat = mats.white;
      const winMat = _col(0x2a3a4a, { roughness: 0.3 });
      const darkMat = mats.horseDark;

      const lower = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.065, 0.48), redMat);
      lower.position.y = 0.055;
      lower.castShadow = true;
      group.add(lower);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.126, 0.06, 0.47), whiteMat);
      upper.position.y = 0.115;
      group.add(upper);

      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.132, 0.032, 0.38), winMat);
      glass.position.y = 0.118;
      group.add(glass);

      const panto = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.08), darkMat);
      panto.position.set(0, 0.165, 0.06);
      group.add(panto);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);
      // [Claude] 移植 v4 彩蛋：點電車搖鈴
      interactives.push({ object: group, name: '紅白路面電車', hint: '點擊：電車搖鈴「叮叮」',
        onClick: () => plazaHooks && plazaHooks.triggerBell && plazaHooks.triggerBell() });
      return _fwdX(group);
    }

    function makeCarriage() {
      const group = new THREE.Group();
      group.name = "ViennaCarriage";

      // [Claude] 黑色車廂、棕馬、金色車燈
      const coachMat = mats.horseDark;
      const horseMat = mats.roofBrown;
      const trimMat = mats.gold;

      const coach = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.075, 0.17), coachMat);
      coach.position.set(0, 0.062, 0);
      coach.castShadow = true;
      group.add(coach);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), trimMat);
      lamp.position.set(0.058, 0.09, 0.06);
      group.add(lamp);

      const horse = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.062, 0.11), horseMat);
      horse.position.set(0, 0.058, 0.15);
      horse.castShadow = true;
      group.add(horse);

      const legFront = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.045, 0.014), horseMat);
      legFront.position.set(0, 0.0225, 0.185);
      group.add(legFront);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);

      let phase = 0;
      // [Claude] 主程式呼叫 update(t, 速度倍率)（v4 介面），改用時間 t 推算步伐，避免每幀 +4.5 造成腿抖動
      const update = (t = 0, speed = 1) => {
        phase = (typeof t === "number" ? t : 0) * 4.5 * (typeof speed === "number" ? speed : 1);
        const step = Math.sin(phase) * 0.012;
        horse.position.y = 0.058 + Math.abs(Math.cos(phase)) * 0.004;
        legFront.rotation.x = step * 18;
      };

      // [Claude] 移植 v4 彩蛋：點馬車馬兒嘶鳴
      interactives.push({ object: group, name: '雙馬馬車', hint: '點擊：馬兒嘶鳴',
        onClick: () => plazaHooks && plazaHooks.triggerHorse && plazaHooks.triggerHorse() });
      return { group: _fwdX(group), update };
    }

    function makePerson(shirtKey) {
      const group = new THREE.Group();
      group.name = "ViennaPerson";

      // [Claude] 主程式傳入 {coatColor}，改單色材質；傘色依衣色挑
      const coatHex = _hexOf(shirtKey, 0x3f7fc0);
      const coatMat = _col(coatHex);
      const headMat = mats.softPeach;
      const umbMat = [mats.viennaRed, mats.roofSlate, mats.roofCopper][coatHex % 3];

      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.028, 0.09, 8), coatMat);
      torso.position.y = 0.065;
      torso.castShadow = true;
      group.add(torso);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), headMat);
      head.position.y = 0.13;
      head.castShadow = true;
      group.add(head);

      const umbrella = new THREE.Group();
      umbrella.visible = false;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.09, 6), umbMat);
      shaft.position.y = 0.175;
      umbrella.add(shaft);

      const canopy = new THREE.Mesh(
        new THREE.ConeGeometry(0.075, 0.035, 10, 1, true),
        umbMat
      );
      canopy.position.y = 0.215;
      umbrella.add(canopy);
      group.add(umbrella);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);

      const setWalk = (walkPhase = 0) => {
        const p = typeof walkPhase === "number" ? walkPhase : 0;
        torso.rotation.z = Math.sin(p) * 0.06;
        head.position.y = 0.13 + Math.abs(Math.cos(p)) * 0.004;
      };

      const setUmbrella = (active = false) => {
        umbrella.visible = Boolean(active);
      };

      return { group, setWalk, setUmbrella };
    }

    function makeTrafficLight() {
      const group = new THREE.Group();
      group.name = "ViennaTrafficLight";

      // [Claude] 每支燈各自的發光材質，setState 切換發光（只改大小看不出哪個燈亮）
      const postMat = mats.horseDark;
      const redMat = new THREE.MeshStandardMaterial({ color: 0x6b2222, emissive: 0x000000 });
      const amberMat = new THREE.MeshStandardMaterial({ color: 0x6b5c22, emissive: 0x000000 });
      const greenMat = new THREE.MeshStandardMaterial({ color: 0x225c36, emissive: 0x000000 });
      disposables.push(redMat, amberMat, greenMat);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.24, 6), postMat);
      post.position.y = 0.12;
      group.add(post);

      const housing = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.078, 0.032), postMat);
      housing.position.set(0, 0.22, 0.015);
      group.add(housing);

      const redBulb = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), redMat);
      redBulb.position.set(0, 0.244, 0.032);
      group.add(redBulb);

      const amberBulb = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), amberMat);
      amberBulb.position.set(0, 0.22, 0.032);
      group.add(amberBulb);

      const greenBulb = new THREE.Mesh(new THREE.SphereGeometry(0.009, 6, 6), greenMat);
      greenBulb.position.set(0, 0.196, 0.032);
      group.add(greenBulb);

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);

      const setState = (state = "green") => {
        // [Claude] 主程式傳 'r' / 'y' / 'g'；也接受 red / amber / yellow / green
        const st = String(state || "").toLowerCase().charAt(0);
        const on = { r: st === "r", y: st === "y" || st === "a", g: st === "g" };
        redMat.emissive.setHex(on.r ? 0xff3b30 : 0); redMat.emissiveIntensity = on.r ? 1.4 : 0;
        amberMat.emissive.setHex(on.y ? 0xffcc00 : 0); amberMat.emissiveIntensity = on.y ? 1.4 : 0;
        greenMat.emissive.setHex(on.g ? 0x34c759 : 0); greenMat.emissiveIntensity = on.g ? 1.4 : 0;
      };
      setState("green");

      return { group, setState };
    }

    function makeCrosswalk(width = 0.34, length = 0.16) {
      const group = new THREE.Group();
      group.name = "ViennaCrosswalk";

      const stripeMat = mats.crosswalkStripe || mats.white; // [Claude] 原本用描邊線材質 → 深色條紋
      const stripes = 5;
      const step = length / stripes;

      for (let i = 0; i < stripes; i++) {
        const bar = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.006, step * 0.52),
          stripeMat
        );
        bar.position.set(0, 0.004, -length * 0.5 + (i + 0.5) * step);
        bar.receiveShadow = true;
        group.add(bar);
      }

      group.position.y = 0; // [Claude] 主程式自行放到路面高度，避免重複 +0.33 浮空
      _track(group);
      return group;
    }

    return {
      makeTree,
      makeCar,
      makeBus,
      makeTram,
      makeCarriage,
      makePerson,
      makeTrafficLight,
      makeCrosswalk,
      plazaHooks: plazaHooks || null,
      interactives: interactives || [],
    };
  }
// ============================================================================
  // 【6. 主組裝函式 buildCityV】
  // [Claude 整合修正] 依 Gemini 第【6】段改寫：
  //  - createSharedResources / buildTerrainAndBase 依第一段實際簽名與回傳值呼叫
  //  - 補上材質別名（第【4】段用到的 wallOchre / wallIvory / roofPatina… 對應到第一段的色票）
  //  - 地標直接用【4】的新建函式（主程式依錨點擺放），不再複製、不再在平台中心另擺示範車輛
  //  - setNight 依 PALETTE.night 漸變所有材質、窗戶發光；不改 windowGlow 的透明度
  // ============================================================================

  function buildCityV(THREE, opts = {}) {
    const options = opts || {};
    const disposables = [];
    const interactives = [];
    const animHooks = [];
    const audioCtxRef = () => options.audio || null; // [Claude] 主程式傳入 {ctx, out}
    const reducedMotion = Boolean(options.reducedMotion);

    const resources = createSharedResources(THREE, options.quality || 'high', disposables);
    const mats = resources.mats;
    const segs = resources.segs;

    // 材質別名（不另建材質，只指向第一段已有的色）
    const ALIAS = {
      wallOchre: 'wallSchonbrunn', wallIvory: 'wallCream', wallSand: 'wallSandstone',
      wallPastelBlue: 'wallSky', wallSage: 'wallMint', roofPatina: 'roofCopper',
      roofDark: 'roofBrown', foliage: 'park', foliageLight: 'parkWarm'
    };
    Object.keys(ALIAS).forEach((k) => { if (!mats[k] && mats[ALIAS[k]]) mats[k] = mats[ALIAS[k]]; });

    const root = new THREE.Group();
    root.name = "ViennaCityPlatform_V";

    const terrain = buildTerrainAndBase(THREE, mats, segs, MAP_DATA, disposables);
    root.add(terrain.group);
    const snowMesh = terrain.snowMesh;
    const roadSnowMesh = terrain.roadSnowMesh;

    // [Claude] 帝國大橋位置：沿河找靠近市中心、橋身與兩端不壓道路／路口／地標／廣場／景點標記的一處
    const BRIDGE_L = 1.5;
    const bridgeSpot = (() => {
      const R = MAP_DATA.river, P = [];
      for (let i = 0; i < R.length - 1; i++) {
        const n = Math.max(1, Math.ceil(Math.hypot(R[i + 1][0] - R[i][0], R[i + 1][1] - R[i][1]) / 0.1));
        for (let k = 0; k < n; k++) P.push([R[i][0] + (R[i + 1][0] - R[i][0]) * k / n, R[i][1] + (R[i + 1][1] - R[i][1]) * k / n]);
      }
      const roadD = (x, z) => {
        let d = 9;
        for (let e = 0; e < MAP_DATA.edges.length; e++) {
          const a = MAP_DATA.nodes[MAP_DATA.edges[e][0]], b = MAP_DATA.nodes[MAP_DATA.edges[e][1]];
          d = Math.min(d, Math.sqrt(distToSegmentSq(x, z, a[0], a[1], b[0], b[1])));
        }
        return d;
      };
      const blocked = (x, z, pad) => {
        if (Math.hypot(x, z) > MAX_RADIUS - 0.3) return true;
        if (roadD(x, z) < ROAD_HALF + pad) return true;
        for (const k in LANDMARK_ANCHORS) { const A = LANDMARK_ANCHORS[k]; if (Math.hypot(x - A.x, z - A.z) < A.r + 0.2 + pad) return true; }
        if (Math.hypot(x - MAP_DATA.plaza[0], z - MAP_DATA.plaza[1]) < 1.56 + pad) return true;
        for (let k = 0; k < MAP_DATA.poi.length; k++) if (Math.hypot(x - MAP_DATA.poi[k].x, z - MAP_DATA.poi[k].z) < 0.3 + pad) return true;
        return false;
      };
      let best = null;
      for (const pad of [0.25, 0.15, 0.08]) {
        for (let i = 2; i < P.length - 2; i++) {
          const a = P[i - 2], b = P[i + 2], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l, c = P[i];
          const ex = BRIDGE_L / 2 + 0.15;
          const probe = [0.5, 0.75, 1].map((f) => [[c[0] + nx * ex * f, c[1] + nz * ex * f], [c[0] - nx * ex * f, c[1] - nz * ex * f]]).flat();
          if (blocked(c[0], c[1], pad + 0.1) || probe.some((q) => blocked(q[0], q[1], pad))) continue;
          const sc = Math.hypot(c[0], c[1]);
          if (!best || sc < best.sc) best = { x: c[0], z: c[1], ry: Math.atan2(-nz, nx), L: BRIDGE_L, sc, ax: c[0] + nx * ex, az: c[1] + nz * ex, bx: c[0] - nx * ex, bz: c[1] - nz * ex };
        }
        if (best) break;
      }
      return best;
    })();
    BRIDGE_ZONE = null;
    if (bridgeSpot) BRIDGE_ZONE = { ax: bridgeSpot.ax, az: bridgeSpot.az, bx: bridgeSpot.bx, bz: bridgeSpot.bz, r: 0.24 };

    const plazaResult = buildPlazaAndLandmarks(
      THREE, mats, segs, MAP_DATA, audioCtxRef, disposables, interactives, animHooks
    );
    root.add(plazaResult.group);

    // [Claude] 中央廣場擺設與音效（移植自 v4）
    const plaza = buildViennaPlaza(THREE, mats, MAP_DATA, audioCtxRef, disposables, interactives, animHooks);
    root.add(plaza.group);

    // [Claude] 地標點擊彩蛋：主程式會讀 userData.interactive 並登記
    const LM_FX = {
      '國家歌劇院': {
        hint: '點擊：傳出《土耳其進行曲》',
        onClick: () => plaza.playMelody([
          [329.63, 0.5], [293.66, 0.5], [277.18, 0.5], [293.66, 0.5],
          [440.0, 1.5], [493.88, 0.5], [523.25, 0.5], [493.88, 0.5],
          [466.16, 0.5], [493.88, 0.5], [659.25, 1.5]
        ], 0.19, 'square')
      },
      '聖史蒂芬大教堂': {
        hint: '點擊：普默林大鐘低沉鳴響',
        onClick: () => plaza.playMelody([[164.81, 3], [0, 0.6], [164.81, 3], [0, 0.6], [164.81, 4]], 0.32, 'sine')
      },
      '普拉特與大摩天輪': {
        hint: '點擊：摩天輪加速，奏《藍色多瑙河》開頭',
        onClick: (g) => {
          const w = g && g.getObjectByName && g.getObjectByName('RiesenradWheel');
          if (w) w.userData.boost = 5;
          plaza.playMelody([
            [293.66, 1], [293.66, 1], [369.99, 1], [440.0, 2], [0, 1],
            [880.0, 1], [880.0, 1], [0, 1], [739.99, 1], [739.99, 2]
          ], 0.2, 'triangle');
        }
      },
      '百水公寓': {
        hint: '點擊：彩色窗戶依序亮起',
        onClick: (g) => {
          if (!g) return;
          const parts = [];
          g.traverse((o) => { if (o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry') parts.push(o); });
          parts.forEach((o, i) => setTimeout(() => {
            const m0 = o.material; o.material = mats.windowGlow;
            setTimeout(() => { o.material = m0; }, 700);
          }, i * 160));
          plaza.playMelody([[523.25, 0.5], [659.25, 0.5], [783.99, 0.5], [1046.5, 1]], 0.16, 'sine');
        }
      }
    };
    const landmarks = {};
    Object.keys(plazaResult.landmarks).forEach((k) => {
      landmarks[k] = () => {
        const g = plazaResult.landmarks[k]();
        const fx = LM_FX[k];
        if (fx) g.userData.interactive = { name: k, hint: fx.hint, onClick: () => fx.onClick(g) };
        return g;
      };
    });

    const factories = buildFactories(THREE, mats, segs, disposables, interactives, plaza);

    // 公園與 Gemini 指定點位的行道樹
    const treeGroup = new THREE.Group();
    treeGroup.name = "ViennaTrees";
    const occupied = plazaResult.occupied || [];
    const rng = seededRandom(5521);
    const cand = [[-1.35, -1.05], [1.25, -1.15], [-2.1, 0.85], [2.1, 1.15], [-0.85, 2.25], [1.4, 2.2]];
    MAP_DATA.parks.forEach(([px, pz, pr]) => {
      const cr = Math.min(pr, Math.max(0.25, MAX_RADIUS - Math.hypot(px, pz) - 0.15)); // 與【3】公園實際繪製半徑一致
      const n = Math.round(cr * 14);
      for (let i = 0; i < n; i++) {
        const a = rng() * Math.PI * 2, rr = Math.sqrt(rng()) * cr * 0.8;
        cand.push([px + Math.cos(a) * rr, pz + Math.sin(a) * rr]);
      }
    });
    let treeCount = 0;
    cand.forEach(([tx, tz], idx) => {
      // 公園內不必避開景點標記，只避開道路、河流、地標、平台邊緣
      if (Math.hypot(tx, tz) > MAX_RADIUS - 0.4) return;
      for (let e = 0; e < MAP_DATA.edges.length; e++) {
        const a = MAP_DATA.nodes[MAP_DATA.edges[e][0]], b = MAP_DATA.nodes[MAP_DATA.edges[e][1]];
        if (distToSegmentSq(tx, tz, a[0], a[1], b[0], b[1]) < (ROAD_HALF + 0.12) * (ROAD_HALF + 0.12)) return;
      }
      for (let r = 0; r < MAP_DATA.river.length - 1; r++) {
        const a = MAP_DATA.river[r], b = MAP_DATA.river[r + 1];
        if (distToSegmentSq(tx, tz, a[0], a[1], b[0], b[1]) < 0.5 * 0.5) return;
      }
      if (isInsidePlaza(tx, tz, MAP_DATA)) return;
      if (inBridgeZone(tx, tz, 0.12)) return;
      for (let k = 0; k < occupied.length; k++) {
        const o = occupied[k];
        if (Math.hypot(tx - o.x, tz - o.z) < o.r + 0.12) return;
      }
      const tree = factories.makeTree(0.9 + (idx % 3) * 0.15);
      tree.position.set(tx, SURFACE_Y, tz);
      tree.rotation.y = rng() * Math.PI * 2;
      treeGroup.add(tree);
      occupied.push({ x: tx, z: tz, r: 0.12 });
      treeCount++;
    });
    treeGroup.userData.count = treeCount;
    root.add(treeGroup);

    // [Claude] 空地花圃：在道路、河流、公園、廣場、地標、街屋、樹、景點標記以外的土黃色空地，
    // 散佈小型綠色花圃＋彩色花朵（InstancedMesh，各 2 個 draw call）。
    const flowerGroup = new THREE.Group();
    flowerGroup.name = "ViennaFlowerBeds";
    const beds = [];
    const frng = seededRandom(9137);
    const okSpot = (x, z, rad) => {
      if (Math.hypot(x, z) > MAX_RADIUS - 0.35 - rad) return false;
      for (let e = 0; e < MAP_DATA.edges.length; e++) {
        const a = MAP_DATA.nodes[MAP_DATA.edges[e][0]], b = MAP_DATA.nodes[MAP_DATA.edges[e][1]];
        if (distToSegmentSq(x, z, a[0], a[1], b[0], b[1]) < Math.pow(ROAD_HALF + 0.04 + rad, 2)) return false;
      }
      for (let n = 0; n < MAP_DATA.nodes.length; n++) {
        if (Math.hypot(x - MAP_DATA.nodes[n][0], z - MAP_DATA.nodes[n][1]) < JUNC_R + 0.06 + rad) return false;
      }
      for (let r = 0; r < MAP_DATA.river.length - 1; r++) {
        const a = MAP_DATA.river[r], b = MAP_DATA.river[r + 1];
        if (distToSegmentSq(x, z, a[0], a[1], b[0], b[1]) < Math.pow(0.45 + rad, 2)) return false;
      }
      for (let k = 0; k < MAP_DATA.parks.length; k++) {
        const pk = MAP_DATA.parks[k];
        if (Math.hypot(x - pk[0], z - pk[1]) < pk[2] + rad) return false;
      }
      if (Math.hypot(x - MAP_DATA.plaza[0], z - MAP_DATA.plaza[1]) < 1.56 + rad) return false;
      if (inBridgeZone(x, z, rad + 0.04)) return false;
      for (let k = 0; k < MAP_DATA.poi.length; k++) {
        if (Math.hypot(x - MAP_DATA.poi[k].x, z - MAP_DATA.poi[k].z) < 0.26 + rad) return false;
      }
      for (let k = 0; k < occupied.length; k++) {
        const o = occupied[k];
        if (Math.hypot(x - o.x, z - o.z) < o.r + rad + 0.02) return false;
      }
      for (let k = 0; k < beds.length; k++) {
        if (Math.hypot(x - beds[k].x, z - beds[k].z) < beds[k].r + rad + 0.06) return false;
      }
      return true;
    };
    for (let gx = -6.4; gx <= 6.4; gx += 0.26) {
      for (let gz = -6.4; gz <= 6.4; gz += 0.26) {
        const x = gx + (frng() - 0.5) * 0.14, z = gz + (frng() - 0.5) * 0.14;
        const rad = 0.08 + frng() * 0.06;
        if (okSpot(x, z, rad)) beds.push({ x, z, r: rad });
      }
    }
    const FLOWER_COLS = [0xe2504a, 0xf08ab0, 0xf4c542, 0xfaf3e6, 0xb38ad8, 0xf28a3c];
    const nHeads = beds.reduce((n, b) => n + Math.round(b.r * 70), 0);
    const bedGeo = new THREE.CylinderGeometry(1, 1.06, 0.014, 12);
    const headGeo = new THREE.IcosahedronGeometry(0.022, 0);
    const bedMat = new THREE.MeshStandardMaterial({ color: PALETTE.day.parkWarm, roughness: 0.9 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    disposables.push(bedGeo, headGeo, bedMat, headMat);
    const bedIM = new THREE.InstancedMesh(bedGeo, bedMat, Math.max(1, beds.length));
    const headIM = new THREE.InstancedMesh(headGeo, headMat, Math.max(1, nHeads));
    const mtx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    let hi = 0;
    beds.forEach((b, i) => {
      mtx.compose(pos.set(b.x, SURFACE_Y + 0.007, b.z), q.identity(), sc.set(b.r, 1, b.r));
      bedIM.setMatrixAt(i, mtx);
      const n = Math.round(b.r * 70), base = Math.floor(frng() * FLOWER_COLS.length);
      for (let k = 0; k < n; k++) {
        const a = frng() * Math.PI * 2, rr = Math.sqrt(frng()) * b.r * 0.85, s2 = 0.7 + frng() * 0.6;
        mtx.compose(pos.set(b.x + Math.cos(a) * rr, SURFACE_Y + 0.026 + frng() * 0.014, b.z + Math.sin(a) * rr), q.identity(), sc.set(s2, s2, s2));
        headIM.setMatrixAt(hi, mtx);
        headIM.setColorAt(hi, col.setHex(FLOWER_COLS[(base + (frng() < 0.7 ? 0 : 1 + Math.floor(frng() * 2))) % FLOWER_COLS.length]));
        hi++;
      }
    });
    bedIM.count = beds.length; headIM.count = hi;
    bedIM.receiveShadow = true; headIM.castShadow = false;
    if (headIM.instanceColor) headIM.instanceColor.needsUpdate = true;
    flowerGroup.add(bedIM, headIM);
    root.add(flowerGroup);
    flowerGroup.userData.count = beds.length;

    const update = (t = 0, dt = 0.016) => {
      for (let i = 0; i < animHooks.length; i++) animHooks[i](t, dt, reducedMotion);
      const wt = mats.river && mats.river.userData.waveTex; // 水波流動速度與城際多瑙河相近
      if (wt) wt.offset.x = reducedMotion ? 0 : -t * 0.17;
    };

    // 日夜：依 PALETTE.day → night 漸變；立面貼圖窗戶與 windowGlow 夜間發光
    const cDay = new THREE.Color(), cNight = new THREE.Color();
    // [Claude] 燈光校正：旅遊島正午 Hemisphere .85 + Directional 1.1，比 Gemini 預覽 (.72 + .92) 亮約 19%，
    // 淺色地面、廣場、人行道會被打成白色。白天色乘上 DAY_K 抵銷，夜間色不變。
    const DAY_K = 0.84;
    const setNight = (n = 0) => {
      const f = Math.max(0, Math.min(1, Number(n) || 0));
      Object.keys(PALETTE.day).forEach((k) => {
        if (PALETTE.night[k] === undefined) return;
        cDay.setHex(PALETTE.day[k]).multiplyScalar(k === 'windowGlow' ? 1 : DAY_K); cNight.setHex(PALETTE.night[k]);
        [mats[k], mats[k + 'Facade'], mats[k + 'Mansard']].forEach((m) => {
          if (m && m.color && k !== 'line' && k !== 'river') m.color.copy(cDay).lerp(cNight, f); // 河水與城際多瑙河相同，不隨日夜改色
        });
      });
      if (mats.line) { cDay.setHex(PALETTE.day.line); cNight.setHex(PALETTE.night.line); mats.line.color.copy(cDay).lerp(cNight, f * 0.35); }
      if (mats.windowGlow) mats.windowGlow.emissiveIntensity = f * 1.6;
      cDay.setHex(PALETTE.day.parkWarm).multiplyScalar(DAY_K); cNight.setHex(PALETTE.night.parkWarm);
      bedMat.color.copy(cDay).lerp(cNight, f);
      headMat.color.setScalar(DAY_K + (0.3 - DAY_K) * f); // 花色以 instanceColor 為主，夜間整體壓暗
      Object.keys(mats).forEach((k) => { if (/Facade$/.test(k)) mats[k].emissiveIntensity = f * 1.1; });
    };

    const setWeather = (weather = {}) => {
      const w = weather || {};
      const snow = typeof w.snow === "number" ? w.snow : 0;
      const snowCover = Math.max(0, Math.min(1, typeof w.snowCover === "number" ? w.snowCover : snow));
      if (snowMesh) snowMesh.visible = snowCover > 0.01;
      if (mats.snowCover) mats.snowCover.opacity = snowCover * 0.92;
      const roadLevel = snowCover * 0.85;
      if (roadSnowMesh) roadSnowMesh.visible = roadLevel > 0.01;
      if (mats.roadSnow) mats.roadSnow.opacity = roadLevel * 0.85;
      root.userData.weather = { sun: w.sun, cloud: w.cloud, rain: w.rain, snow, snowCover };
    };

    const dispose = () => {
      for (let i = 0; i < disposables.length; i++) {
        const item = disposables[i];
        if (item && typeof item.dispose === "function") item.dispose();
      }
      disposables.length = 0;
    };

    setNight(0);
    setWeather({ sun: 1 });

    return {
      group: root,
      update,
      setNight,
      setWeather,
      landmarks,
      makeTree: factories.makeTree,
      makeCar: factories.makeCar,
      makeBus: factories.makeBus,
      makeTram: factories.makeTram,
      makeCarriage: factories.makeCarriage,
      makePerson: factories.makePerson,
      makeTrafficLight: factories.makeTrafficLight,
      makeCrosswalk: factories.makeCrosswalk,
      interactives,
      roadSpec: ROAD_SPEC,
      bridgeSpot, // [Claude] 帝國大橋位置；模型由主程式（scene2.js 的 S2bridgeModel）放置
      landmarkAnchors: LANDMARK_ANCHORS,
      dispose,
      stats: { flowerBeds: beds.length, townhouses: plazaResult.group.children.find((c) => c.name === 'ViennaTownhouseRows').userData.count, trees: treeCount }
    };
  }

  // ============================================================================
  // 【7. 全域平台註冊 window.CITY_PLATFORMS】
  // ============================================================================

  if (typeof window !== "undefined") {
    window.CITY_PLATFORMS = window.CITY_PLATFORMS || {};
    window.CITY_PLATFORMS.v = { build: buildCityV };
  }
})();
