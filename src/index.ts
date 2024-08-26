import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  mobileAndTabletCheck,
  BloomPlugin,
  Vector3,
  GammaCorrectionPlugin,
  MeshBasicMaterial2,
  Color,
  AssetImporter,
} from 'webgi';
import './styles.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

// Menginisialisasi plugin Lenis untuk animasi scroll yang halus
const lenis = new Lenis({
  duration: 1.2, // Durasi animasi scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Fungsi easing untuk animasi scroll
  direction: 'vertical', // Arah scroll, bisa vertical atau horizontal
  gestureDirection: 'vertical', // Arah scroll dengan gesture (misalnya touch)
  smooth: true, // Mengaktifkan animasi scroll yang halus
  mouseMultiplier: 1, // Mengatur kecepatan scroll dengan mouse
  smoothTouch: false, // Mengaktifkan atau menonaktifkan animasi scroll pada perangkat sentuh
  touchMultiplier: 2, // Mengatur kecepatan scroll dengan sentuhan
  infinite: false, // Mengatur apakah scroll bersifat infinite atau tidak
});

// Menghentikan sementara scroll animasi sampai diperlukan
lenis.stop();

// Fungsi rekursif untuk memulai animasi frame per frame
function raf(time: number) {
  lenis.raf(time); // Memperbarui animasi scroll pada setiap frame
  requestAnimationFrame(raf); // Melanjutkan loop animasi
}

// Memulai loop animasi
requestAnimationFrame(raf);

// Mendaftarkan plugin ScrollTrigger dari GSAP
gsap.registerPlugin(ScrollTrigger);

// Fungsi asinkron untuk menyiapkan tampilan WebGL Viewer
async function setupViewer() {
  const viewer = new ViewerApp({
    canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement, // Menghubungkan canvas HTML dengan viewer
    // isAntialiased: true, // Opsional: Mengaktifkan anti-aliasing
  });

  const isMobile = mobileAndTabletCheck(); // Mengecek apakah perangkat adalah mobile atau tablet

  const manager = await viewer.addPlugin(AssetManagerPlugin); // Menambahkan plugin untuk manajemen asset
  const camera = viewer.scene.activeCamera; // Mengambil kamera aktif dari scene
  const position = camera.position; // Mengambil posisi kamera
  const target = camera.target; // Mengambil target kamera (titik yang dituju)
  const exitButton = document.querySelector('.button--exit') as HTMLElement; // Mengambil elemen tombol exit
  const customizerInterface = document.querySelector('.customizer--container') as HTMLElement; // Mengambil elemen interface customizer

  // Menambahkan plugin satu per satu ke viewer
  await viewer.addPlugin(GBufferPlugin);
  await viewer.addPlugin(new ProgressivePlugin(32));
  await viewer.addPlugin(new TonemapPlugin(true));
  await viewer.addPlugin(GammaCorrectionPlugin);
  await viewer.addPlugin(SSRPlugin);
  await viewer.addPlugin(SSAOPlugin);
  await viewer.addPlugin(BloomPlugin);

  // Loader
  const importer = manager.importer as AssetImporter;

  // Mengatur progress bar untuk menunjukkan progress loading
  importer.addEventListener('onProgress', (ev) => {
    const progressRatio = ev.loaded / ev.total;
    // Mengupdate progress bar berdasarkan rasio loading
    document.querySelector('.progress')?.setAttribute('style', `transform: scaleX(${progressRatio})`);
  });

  // Event listener ketika loading selesai
  importer.addEventListener('onLoad', (ev) => {
    gsap.to('.loader', {
      x: '100%',
      duration: 0.8,
      ease: 'power4.inOut',
      delay: 1,
      onComplete: () => {
        document.body.style.overflowY = 'auto'; // Mengaktifkan scroll pada body
        lenis.start(); // Memulai animasi scroll dengan Lenis
      },
    });
  });

  viewer.renderer.refreshPipeline(); // Menyegarkan pipeline renderer

  // Memuat model 3D dari file GLB
  await manager.addFromPath('./assets/drill3.glb');

  const drillMaterial = manager.materials!.findMaterialsByName('Drill_01')[0] as MeshBasicMaterial2; // Mengambil material dari model

  viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true; // Mengatur background clipping

  // Menonaktifkan kontrol kamera
  viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

  if (isMobile) {
    // Mengatur posisi kamera dan target untuk perangkat mobile
    position.set(-3.5, -1.1, 5.5);
    target.set(-0.8, 1.55, -0.7);
    camera.setCameraOptions({ fov: 40 }); // Mengatur field of view
  }

  onUpdate(); // Memperbarui viewer

  window.scrollTo(0, 0); // Mengatur scroll ke atas

  // Fungsi untuk menyiapkan animasi scroll
  function setupScrollanimation() {
    const tl = gsap.timeline(); // Membuat timeline GSAP

    // ANIMASI PADA SECTION PERTAMA
    tl.to(position, {
      x: isMobile ? -6.0 : 1.56,
      y: isMobile ? 5.5 : -2.26,
      z: isMobile ? -3.3 : -3.85,
      scrollTrigger: {
        trigger: '.second', // Elemen yang memicu animasi
        start: 'top bottom', // Mulai animasi saat top elemen "second" bertemu dengan bottom viewport
        end: 'top top', // Berakhir saat top elemen "second" bertemu dengan top viewport
        scrub: true, // Animasi mengikuti posisi scroll
        immediateRender: false,
      },
      onUpdate,
    })

      .to('.section--one--container', {
        xPercent: '-150',
        opacity: 0, // Menggeser dan menyembunyikan konten
        scrollTrigger: {
          trigger: '.second',
          start: 'top bottom',
          end: 'top 80%',
          scrub: 1,
          immediateRender: false,
        },
      })
      .to(target, {
        x: isMobile ? -1.1 : -1.37,
        y: isMobile ? 1.0 : 1.99,
        z: isMobile ? -0.1 : -0.37,
        scrollTrigger: {
          trigger: '.second',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          immediateRender: false,
        },
      })

      // ANIMASI PADA SECTION TERAKHIR
      .to(position, {
        x: -3.4,
        y: 9.6,
        z: 1.71,
        scrollTrigger: {
          trigger: '.third',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })

      .to(target, {
        x: -1.5,
        y: 2.13,
        z: -0.4,
        scrollTrigger: {
          trigger: '.third',
          start: 'top bottom',
          end: 'top top',
          scrub: true,
          immediateRender: false,
        },
      });
  }

  setupScrollanimation(); // Memanggil fungsi untuk mengatur animasi scroll

  // WEBGI UPDATE
  let needsUpdate = true;

  function onUpdate() {
    needsUpdate = true;
    viewer.setDirty(); // Menandai viewer untuk di-update
  }

  viewer.addEventListener('preFrame', () => {
    if (needsUpdate) {
      camera.positionTargetUpdated(true); // Memperbarui posisi kamera
      needsUpdate = false;
    }
  });

  // EVENT UNTUK TOMBOL "KNOW MORE"
  document.querySelector('.button--hero')?.addEventListener('click', () => {
    const element = document.querySelector('.second');
    window.scrollTo({ top: element?.getBoundingClientRect().top, left: 0, behavior: 'smooth' }); // Scroll ke section kedua
  });

  // SCROLL KE ATAS
  document.querySelectorAll('.button--footer')?.forEach((item) => {
    item.addEventListener('click', () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // Scroll ke atas halaman
    });
  });

  // EVENT UNTUK TOMBOL "CUSTOMIZE"
  const sections = document.querySelector('.container') as HTMLElement;
  const mainContainer = document.getElementById('webgi-canvas-container') as HTMLElement;
  document.querySelector('.button--customize')?.addEventListener('click', () => {
    sections.style.display = 'none'; // Menyembunyikan section utama
    mainContainer.style.pointerEvents = 'all'; // Mengaktifkan pointer events pada main container
    document.body.style.cursor = 'grab'; // Mengubah cursor menjadi "grab"
    lenis.stop(); // Menghentikan animasi scroll

    // Menggerakkan kamera ke posisi untuk customize mode
    gsap.to(position, { x: -2.6, y: 0.2, z: -9.6, duration: 2, ease: 'power3.inOut', onUpdate });
    gsap.to(target, { x: -0.15, y: 1.18, z: 0.12, duration: 2, ease: 'power3.inOut', onUpdate, onComplete: enableControlers });
  });

  function enableControlers() {
    exitButton.style.display = 'block'; // Menampilkan tombol exit
    customizerInterface.style.display = 'block'; // Menampilkan customizer interface
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: true }); // Mengaktifkan kontrol kamera
  }

  // EVENT UNTUK KELUAR DARI MODE CUSTOMIZER
  exitButton.addEventListener('click', () => {
    // Menggerakkan kamera kembali ke posisi semula
    gsap.to(position, { x: -3.4, y: 9.6, z: 1.71, duration: 1, ease: 'power3.inOut', onUpdate });
    gsap.to(target, { x: -1.5, y: 2.13, z: -0.4, duration: 1, ease: 'power3.inOut', onUpdate });

    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false }); // Menonaktifkan kontrol kamera
    sections.style.display = 'contents'; // Menampilkan section utama kembali
    mainContainer.style.pointerEvents = 'none'; // Menonaktifkan pointer events pada main container
    document.body.style.cursor = 'default'; // Mengembalikan cursor ke default
    exitButton.style.display = 'none'; // Menyembunyikan tombol exit
    customizerInterface.style.display = 'none'; // Menyembunyikan customizer interface
    lenis.start(); // Memulai kembali animasi scroll
  });

  // EVENT UNTUK MENGUBAH WARNA MATERIAL
  document.querySelector('.button--colors.black')?.addEventListener('click', () => {
    changeColor(new Color(0x383830).convertSRGBToLinear()); // Mengubah warna ke hitam
  });

  document.querySelector('.button--colors.red')?.addEventListener('click', () => {
    changeColor(new Color(0xfe2d2d).convertSRGBToLinear()); // Mengubah warna ke merah
  });

  document.querySelector('.button--colors.yellow')?.addEventListener('click', () => {
    changeColor(new Color(0xffffff).convertSRGBToLinear()); // Mengubah warna ke kuning
  });

  // Fungsi untuk mengubah warna material
  function changeColor(_colorToBeChanged: Color) {
    drillMaterial.color = _colorToBeChanged;
    viewer.scene.setDirty(); // Menandai scene untuk di-update
  }
}

setupViewer(); // Menjalankan fungsi setupViewer untuk memulai aplikasi
