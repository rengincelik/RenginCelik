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
    support: 'I take hard technical problems and turn them into working, validated software.',
  },

  about: {
    // One string per paragraph. Keep it short.
    paragraphs: [
      "I'm a junior software developer who builds complete projects end to end: C++ libraries and engines, browser apps in plain JavaScript, and small serverless APIs. I come to software from engineering — a B.Sc. in Food Engineering from Istanbul Technical University — which is where I learned to break a hard problem down before writing any code.",
      "I wanted to be an engineer for as long as I can remember. What I didn't expect was that software would end up being the way I got there. Partway through my degree, sitting in class, I kept catching myself thinking we could just code this — turn the equation on the board into something that actually runs. After graduating I started learning software more seriously, and once I had enough footing, I went back and rebuilt what I'd learned in school as real, working projects. That's the part I want to keep doing: taking a hard technical problem and solving it in code.",
      "I learn fastest by building. I picked up JavaScript to build PipeFlow, a dependency-free simulation app that runs in the browser, in two months. I wrote I Fall Suddenly, a bilingual web app with its own small serverless API, without a framework. I'm now writing a C++ simulation engine that runs both natively and in the browser through WebAssembly, and I implemented a shader from scratch within a week while working on GPU projects at iBright.",
      "I'm looking for a junior software developer role — backend, full-stack or general software development, where the job is writing code and solving the problem itself. Based between Sofia, Bulgaria and Istanbul, Turkey. As an EU citizen (Bulgaria), I require no visa sponsorship anywhere in Europe.",
    ],
  },

  contact: {
    email: 'rengin.celik97@gmail.com',
    githubRepo: 'https://github.com/rengincelik/RenginCelik',
    githubProfile: 'https://github.com/rengincelik',
    linkedin: 'https://linkedin.com/in/rengincelik',
	  portfolio: 'assets/documents/Rengin_Celik_Portfolio.pdf',
    cv: 'assets/documents/Rengin_Celik_Resume.pdf',
  },
};