/**
 * Work experience, newest first. The Experience section is rendered entirely
 * from this array: to add a job, add an object.
 *
 * @typedef {Object} Job
 * @property {string} id          Unique slug; used for the #job-<id> anchor.
 * @property {string} company
 * @property {string} [location]
 * @property {string} role
 * @property {string} period      Free text, e.g. 'Aug 2025 – Nov 2025'.
 * @property {{title: string, items: (string | {label: string, text: string})[]}[]} groups
 *           Bullet groups. An item is a string, or {label, text} to render a bold lead-in.
 * @property {string[]} [tags]
 * @property {{label: string, url: string}[]} [links]
 */

/** @type {Job[]} */
export const experience = [
  {
    id: 'ibright',
    company: 'iBright',
    location: 'Istanbul, Turkey',
    role: 'Software Developer (Unity / Tools)',
    period: 'Aug 2025 – Nov 2025',
    groups: [
      {
        title: 'Graphics & GPU Rendering',
        items: [
          {
            label: 'High-Performance Instancing',
            text: 'Three progressive approaches (DrawMeshInstanced, Indirect, Compute-driven) rendering over one million objects in a single draw call',
          },
          {
            label: 'GPU Optimization',
            text: 'Frustum and spherical culling via compute shaders with atomic operations, offloading heavy calculations from CPU',
          },
          {
            label: 'Procedural Systems',
            text: 'GPU-driven grass rendering with Compute Shaders, procedural generation, and ProBuilder integration',
          },
        ],
      },
      {
        title: 'Advanced Shaders',
        items: [
          {
            label: 'Fabric Shaders',
            text: 'Physically-based silk shader (anisotropic GGX, Fresnel, iridescence, sheen BRDF); velvet shader (rim lighting, SSS, procedural fuzz scatter)',
          },
          {
            label: 'Environment Shaders',
            text: 'Dynamic water surfaces with vertex displacement, procedural wave simulation, depth-based coloring',
          },
        ],
      },
      {
        title: 'Systems & Tooling',
        items: [
          {
            label: 'Movement Framework',
            text: 'Modular 2D/3D input-movement system using State Machine architecture and ScriptableObject-driven animation pipelines',
          },
        ],
      },
    ],
    tags: ['Unity URP', 'HLSL', 'Compute Shaders', 'C#', 'GPU Instancing', 'Editor Scripting'],
    links: [
      { label: 'GPU Rendering', url: 'https://github.com/rengincelik/GPU_Rendering' },
      { label: 'Shaders', url: 'https://github.com/rengincelik/Shaders' },
      { label: 'Mini Dev Kit', url: 'https://github.com/rengincelik/Mini-Dev-Kit' },
    ],
  },
];
