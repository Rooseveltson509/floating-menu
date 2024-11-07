import { activateCaptureMode } from './screenShot';
import { openPopup } from './popup';

export function displayMenu(): void {
    console.log("Affichage du menu flottant"); // Debug

    const floatingMenu: HTMLDivElement = document.createElement("div");
    floatingMenu.className = "floating-menu my-extension-floating-menu";

    // Exemple d'élément de menu
    const menuItem = document.createElement("div");
    menuItem.textContent = "Item de menu";
    floatingMenu.appendChild(menuItem);

    // Bouton de fermeture du menu
    const closeButton: HTMLDivElement = document.createElement("div");
    closeButton.className = "close-button";
    closeButton.textContent = "✖";
    closeButton.addEventListener("click", () => {
        floatingMenu.style.display = "none";
    });
    floatingMenu.appendChild(closeButton);

    // Ajouter le menu flottant au DOM
    document.body.appendChild(floatingMenu);
}
