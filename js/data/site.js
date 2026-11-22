/**
 * Site-wide copy. Every "[ADD: ...]" is a placeholder for you to fill in.
 * Structural labels (Work, About, Contact, ...) live in the components.
 */
export const site = {
  name: 'Rengin Çelik',

  nav: [
    { label: 'Work', href: '#work' },
	  { label: 'Experience', href: '#experience' },
    { label: 'About', href: '#about' },
    { label: 'Contact', href: '#contact' },
  ],

  hero: {
    statement: 'Engineering background. Software builder.',
    support: 'I come from an engineering background and learn fastest by building.',
  },

  about: {
    // One string per paragraph. Keep it short.
    paragraphs: [
      "I'm a software developer with an engineering background — a B.Sc. in Food Engineering from Istanbul Technical University, grounded in fluid mechanics, thermodynamics, and numerical methods.",
      "I wanted to be an engineer for as long as I can remember. What I didn't expect was that software would end up being the way I got there. Partway through my degree, sitting in class, I kept catching myself thinking we could just code this — turn the equation on the board into something that actually runs. After graduating I started learning software more seriously, and once I had enough footing, I went back and rebuilt what I'd learned in school as real, working projects. That's the part I want to keep doing: taking a hard technical problem and solving it in code.",
      "I learn fastest by building. I implemented a shader from scratch within a week while working on Unity/GPU projects at iBright. I picked up JavaScript to build PipeFlow, a dependency-free browser-based hydraulics simulator, in two months. I'm currently developing a 2D CFD solver in C++, with a working demo in three months.",
      "I'm looking for a junior software developer role — ideally backend, systems, or tools-focused work. Based between Sofia, Bulgaria and Istanbul, Turkey. As an EU citizen (Bulgaria), I require no visa sponsorship anywhere in Europe.",
    ],
  },

  contact: {
    email: 'rengin.celik97@gmail.com',
    githubRepo: 'https://github.com/rengincelik/RenginCelik',
    githubProfile: 'https://github.com/rengincelik',
    linkedin: 'https://linkedin.com/in/rengincelik',
    cv: 'Rengin_Celik_Resume.pdf',
  },
};