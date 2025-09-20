declare module 'three/examples/jsm/loaders/STLLoader' {
  import { BufferGeometry, Loader } from 'three';

  export class STLLoader extends Loader {
    constructor();
    parse(data: ArrayBuffer | string): BufferGeometry;
    load(
      url: string,
      onLoad: (geometry: BufferGeometry) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (event: unknown) => void,
    ): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, Event, EventDispatcher, MOUSE, TOUCH, Vector3 } from 'three';

  export class OrbitControls extends EventDispatcher<Event> {
    constructor(object: Camera, domElement?: HTMLElement | null);

    object: Camera;
    domElement: HTMLElement | Document;

    enabled: boolean;

    target: Vector3;

    minDistance: number;
    maxDistance: number;

    minZoom: number;
    maxZoom: number;

    minPolarAngle: number;
    maxPolarAngle: number;

    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    enableDamping: boolean;
    dampingFactor: number;

    enableZoom: boolean;
    zoomSpeed: number;

    enableRotate: boolean;
    rotateSpeed: number;

    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };

    update(): boolean;
    saveState(): void;
    reset(): void;
    dispose(): void;
    getPolarAngle(): number;
    getAzimuthalAngle(): number;
    getDistance(): number;
  }
}
