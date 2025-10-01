// Theme boot (respect system + remember)
(function(){
  const ls = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (ls === 'light' || (!ls && prefersLight)) document.documentElement.classList.add('light');
})();

function toggleTheme(){
  const el = document.documentElement;
  const isLight = el.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
}

// Mark current nav item active
(function(){
  const path = location.pathname.replace(/\/+$/, '');
  document.querySelectorAll('header nav a').forEach(a=>{
    const href = a.getAttribute('href').replace(/\/+$/, '');
    if(href && (href === path || (href === '/' && (path === '' || path === '/')))){
      a.classList.add('active');
    }
  });
})();
