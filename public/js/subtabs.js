//makes the subtabs for the main edit tab
function setupSubTabs() {
  const subTabs = document.querySelectorAll('.tabs.sub-tabs .tab');
  const subTabContents = document.querySelectorAll('.sub-tab-content');

  subTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.subtab;

      subTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      subTabContents.forEach(content => {
        content.classList.toggle('active', content.id === targetId);
        
        if (targetId === 'locations' && typeof window.attachEditLocListener === 'function') {
          window.attachEditLocListener();
        }
      });
    });
  });

}

window.addEventListener('DOMContentLoaded', setupSubTabs);