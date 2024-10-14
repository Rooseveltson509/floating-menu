const floatingMenu = document.createElement('div');
floatingMenu.className = 'floating-menu';
floatingMenu.style.position = 'fixed';
floatingMenu.style.right = '20px';
floatingMenu.style.top = '50%';
floatingMenu.style.transform = 'translateY(-50%)';
floatingMenu.style.backgroundColor = '#f0f0f0';
floatingMenu.style.padding = '10px';
floatingMenu.style.borderRadius = '8px';
floatingMenu.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
floatingMenu.style.zIndex = '1000';
floatingMenu.style.display = 'flex';
floatingMenu.style.flexDirection = 'column';
floatingMenu.style.alignItems = 'center';

const createMenuItem = (url, iconSrc, altText) => {
  const menuItem = document.createElement('div');
  menuItem.style.margin = '10px 0';
  menuItem.style.cursor = 'pointer';
  const icon = document.createElement('img');
  icon.src = iconSrc;
  icon.alt = altText;
  icon.style.width = '32px';
  icon.style.height = '32px';
  menuItem.appendChild(icon);
  menuItem.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openTab', url });
  });
  return menuItem;
};

floatingMenu.appendChild(createMenuItem('#', 'https://png.pngtree.com/png-vector/20211102/ourmid/pngtree-u-logo-design-png-image_4020571.png', 'U'));
floatingMenu.appendChild(createMenuItem('#', 'https://w7.pngwing.com/pngs/349/305/png-transparent-computer-icons-internet-forum-comment-miscellaneous-monochrome-black-thumbnail.png', 'Comment'));
floatingMenu.appendChild(createMenuItem('#', 'https://e7.pngegg.com/pngimages/615/837/png-clipart-heart-symbol-love-symbol-love-text.png', 'Heart'));
floatingMenu.appendChild(createMenuItem('#', 'https://thumbs.dreamstime.com/z/ic%C3%B4ne-transparente-de-baguette-magique-conception-symbole-f%C3%A9e-130319799.jpg', 'Magic'));
floatingMenu.appendChild(createMenuItem('', 'https://cdn3d.iconscout.com/3d/premium/thumb/three-point-five-star-rating-3d-icon-download-in-png-blend-fbx-gltf-file-formats--like-logo-stars-rate-ratings-pack-user-interface-icons-7516630.png', 'Rating'));

const closeButton = document.createElement('div');
closeButton.textContent = '✖';
closeButton.style.backgroundColor = '#ff6347';
closeButton.style.color = 'white';
closeButton.style.padding = '5px';
closeButton.style.borderRadius = '50%';
closeButton.style.cursor = 'pointer';
closeButton.style.textAlign = 'center';
closeButton.style.width = '24px';
closeButton.style.height = '24px';
closeButton.addEventListener('click', () => {
  floatingMenu.style.display = 'none';
});
floatingMenu.appendChild(closeButton);

document.body.appendChild(floatingMenu);
