//import html2canvas from "html2canvas";
declare var html2canvas: any;

// URLs des icônes
const iconUrl1: string = chrome.runtime.getURL("./assets/icons/icon16.svg");
const iconUrl2: string = chrome.runtime.getURL("./assets/icons/icon48.svg");
const iconUrl3: string = chrome.runtime.getURL("./assets/icons/icon64.svg");
const iconUrl4: string = chrome.runtime.getURL("./assets/icons/icon128.svg");

let clickCount: number = 0;
let clickTimeout: NodeJS.Timeout;
let formOverlay: HTMLDivElement | null = null; // Pour s'assurer qu'un seul formulaire s'affiche
let selectionBox: HTMLDivElement | null = null; // Pour la boîte de sélection
let isFormOpen = false; // Variable pour vérifier l'état du formulaire

// Variables pour suivre la sélection de la zone
let startX: number, startY: number;
let capturedImageUri: string | null = null; // Stocker l'image capturée pour affichage
let popupOverlay: HTMLDivElement | null = null; // Conserver une seule instance du formulaire

// Élément bulle avec icône pour le mode capture
let captureBubble: HTMLDivElement | null = null;

// Fonction pour créer la bulle de capture qui suit la souris
function createCaptureBubble() {
    if (!captureBubble) {
        captureBubble = document.createElement("div");
        captureBubble.style.position = "absolute";
        captureBubble.style.width = "50px";
        captureBubble.style.height = "50px";
        captureBubble.style.backgroundColor = "#F0F4FF";
        captureBubble.style.borderRadius = "50%";
        captureBubble.style.display = "flex";
        captureBubble.style.alignItems = "center";
        captureBubble.style.justifyContent = "center";
        captureBubble.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
        captureBubble.style.cursor = "pointer";
        captureBubble.style.zIndex = "10001";
        captureBubble.style.pointerEvents = "none"; // Empêche l'interaction avec la bulle

        // Icône d'appareil photo dans la bulle
        const cameraIcon = document.createElement("span");
        cameraIcon.style.fontSize = "24px";
        cameraIcon.textContent = "📷"; // Emoji d'appareil photo
        captureBubble.appendChild(cameraIcon);

        document.body.appendChild(captureBubble);
        // Suivre le mouvement de la souris pour placer la bulle
        document.addEventListener("mousemove", updateCaptureBubblePosition);

    }
}

// Mettre à jour la position de la bulle de capture pour suivre la souris
function updateCaptureBubblePosition(event: MouseEvent) {
    if (captureBubble) {
        // Place la bulle un peu en dessous de la souris pour qu'elle ne la cache pas
        captureBubble.style.left = `${event.pageX + 15}px`;
        captureBubble.style.top = `${event.pageY + 15}px`;
    }
}

// Fonction pour enlever la bulle de capture et arrêter de suivre la souris
function removeCaptureBubble() {
    if (captureBubble) {
        captureBubble.remove();
        captureBubble = null;
    }
    document.removeEventListener("mousemove", updateCaptureBubblePosition);
}

// Détection de trois clics consécutifs
document.addEventListener("click", () => {
    clickCount++;
    const existingMenu = document.querySelector(".floating-menu");

    // Réinitialisez le compteur après 1,5 secondes s'il n'y a pas d'autre clic
    clearTimeout(clickTimeout);
    clickTimeout = setTimeout(() => {
        clickCount = 0;
    }, 1500);

    // Si trois clics sont détectés, affichez le menu
    if (clickCount >= 3) {
        if (existingMenu) {
            existingMenu.remove();
        } else {
            clickCount = 0; // Réinitialisez le compteur
            displayMenu();  // Affichez le menu
        }
    }
});

// Fonction pour afficher le menu flottant
function displayMenu(): void {
    const floatingMenu: HTMLDivElement = document.createElement("div");
    floatingMenu.className = "floating-menu my-extension-floating-menu";

    // Fonction pour créer un élément de menu
    const createMenuItem = (url: string, iconSrc: string, altText: string, id: string): HTMLDivElement => {
        const menuItem: HTMLDivElement = document.createElement("div");
        menuItem.style.cursor = "pointer";
        const icon: HTMLImageElement = document.createElement("img");
        const hr: HTMLHRElement = document.createElement("hr");
        icon.src = iconSrc;
        icon.id = id;
        icon.alt = altText;
        menuItem.appendChild(icon);
        menuItem.appendChild(hr);
        menuItem.addEventListener("click", () => {
            chrome.runtime.sendMessage({ action: "openTab", url });
        });
        return menuItem;
    };

    // Ajouter les éléments de menu
    floatingMenu.appendChild(createMenuItem(iconUrl1, iconUrl1, "U", "uIcon"));
    floatingMenu.appendChild(createMenuItem(iconUrl2, iconUrl2, "Comment", "commentIcon"));
    floatingMenu.appendChild(createMenuItem(iconUrl3, iconUrl3, "Heart", "heartIcon"));
    floatingMenu.appendChild(createMenuItem(iconUrl4, iconUrl4, "Magic", "magicIcon"));

    // Ajouter un bouton de capture
    /*     const captureButton: HTMLButtonElement = document.createElement("button");
        captureButton.textContent = "📸 Capturer";
        captureButton.style.display = "block";
        captureButton.style.margin = "10px 0";
        captureButton.addEventListener("click", activateCaptureMode);
    
        floatingMenu.appendChild(captureButton); */
    document.body.appendChild(floatingMenu);

    // Bouton de fermeture
    const closeButton: HTMLDivElement = document.createElement("div");
    closeButton.className = "close-button";
    closeButton.textContent = "✖";
    closeButton.addEventListener("click", () => {
        floatingMenu.style.display = "none";
    });
    floatingMenu.appendChild(closeButton);

    // Ajouter le menu flottant au DOM
    document.body.appendChild(floatingMenu);
    // Rendre le menu déplaçable après l'ajout au DOM
    makeMenuDraggable(floatingMenu);



    // Ajouter un gestionnaire d'événement pour ouvrir la popup
    const commentIcon = document.getElementById("commentIcon");
    if (commentIcon) {
        commentIcon.addEventListener("click", openPopup);
    }
}



// Fonction pour ouvrir une popup
function openPopup(): void {
    // Assurer que le mode capture est complètement désactivé avant d'ouvrir le formulaire
    disableCaptureMode();

    if (!popupOverlay) {
        popupOverlay = document.createElement('div');
        popupOverlay.id = 'popup-overlay';
        popupOverlay.innerHTML = `
    <div id="popup-content">
        <div class="form-container my-extension-form">
            <p class="form-title">Qu’est-ce qui vous agace ?</p>
            <textarea class="form-textarea" placeholder="Décrivez votre problème." id="text-input"></textarea>
            <div class="microphone-icon">
                <span>🎤</span>
            </div>
                        <!-- Bouton de capture d'écran -->
            <button type="button" id="capture-button">📸 Capturer une zone</button>
            
            <!-- Aperçu de l'image capturée -->
            <img id="screenshot-preview" src="${capturedImageUri ? capturedImageUri : ''}" style="display: ${capturedImageUri ? 'block' : 'none'}; width: 100px; height: 100px; margin-top: 10px;" />
            <div class="emoji-picker">
                <label class="emoji-label">
                    <input type="checkbox" class="emoji-checkbox">
                    Je suis bloquée
                </label>
                <button class="emoji-button" id="emoji-button">😷</button>
                <div class="emoji-options" id="emoji-options">
                    <button class="emoji-option">😐</button>
                    <button class="emoji-option">😤</button>
                    <button class="emoji-option">😡</button>
                    <button class="emoji-option">😞</button>
                    <button class="emoji-option">🤔</button>
                    <button class="emoji-option">😫</button>
                    <button class="emoji-option">😵</button>
                    <button class="emoji-option">😟</button>
                    <button class="emoji-option">😖</button>
                    <button class="emoji-option">🤣</button>
                </div>
            </div>
            <button type="button" id="submit-arrow" class="submit-arrow" disabled>➡️</button>
            <button type="button" id="close-popup">Fermer</button>

        </div>
    </div>
    `;
        document.body.appendChild(popupOverlay);

        // Configurer les événements
        setupFormEventListeners();
    }

    // Rétablit l'image capturée si elle existe
    const preview = document.getElementById("screenshot-preview") as HTMLImageElement;
    if (preview && capturedImageUri) {
        preview.src = capturedImageUri;
        preview.style.display = "block";
    }
    popupOverlay.style.display = 'flex';
    isFormOpen = true;

    // Gestionnaire pour fermer le popup
    const closePopupButton = document.getElementById('close-popup');
    if (closePopupButton) {
        closePopupButton?.addEventListener('click', () => {
            if (popupOverlay) {
                document.body.removeChild(popupOverlay); // Vérifie que popupOverlay n'est pas null
                popupOverlay = null;
                isFormOpen = false;
            }
        });
    }

    // Gestionnaire du bouton de capture d'écran
    /*     const captureButton = document.getElementById("capture-button");
        captureButton?.addEventListener("click", () => {
            popupOverlay!.style.display = "none"; // Fermer temporairement le formulaire
            activateCaptureMode(); // Activer le mode de sélection de capture d'écran
        }); */

    /*     document.getElementById("submit-arrow")!.addEventListener("click", () => {
            const textInput = document.getElementById("text-input") as HTMLTextAreaElement;
            const screenshotPreview = document.getElementById("screenshot-preview") as HTMLImageElement;
    
            if (textInput.value.trim() !== "" && screenshotPreview.src) {
                // Préparez les données à envoyer
                const formData = new FormData();
                formData.append("text", textInput.value);
                formData.append("screenshot", screenshotPreview.src);
    
                // Exemple d'envoi avec fetch
                fetch("https://example.com/api/submit", {
                    method: "POST",
                    body: formData,
                })
                    .then(response => response.json())
                    .then(data => {
                        alert("Message envoyé avec succès !");
                        // Réinitialisez le formulaire
                        textInput.value = "";
                        screenshotPreview.style.display = "none";
                        screenshotPreview.src = "";
                    })
                    .catch(error => {
                        console.error("Erreur lors de l'envoi :", error);
                        alert("Une erreur s'est produite lors de l'envoi.");
                    });
            } else {
                alert("Veuillez entrer du texte et capturer une image avant d'envoyer.");
            }
        }); */
}

// Fonction pour initialiser le formulaire avec le bouton d'ouverture
document.addEventListener("DOMContentLoaded", () => {
    const openFormButton = document.createElement("button");
    openFormButton.textContent = "Ouvrir le formulaire";
    openFormButton.onclick = openPopup;
    document.body.appendChild(openFormButton);
});


// Fonction pour configurer les événements du formulaire
function setupFormEventListeners() {
    const emojiButton = document.getElementById("emoji-button")!;
    const emojiOptions = document.getElementById("emoji-options")!;
    emojiButton.addEventListener("click", () => {
        emojiOptions.style.display = emojiOptions.style.display === "block" ? "none" : "block";
    });

    emojiOptions.querySelectorAll(".emoji-option").forEach(option => {
        option.addEventListener("click", (event) => {
            const selectedEmoji = (event.target as HTMLElement).textContent;
            emojiButton.textContent = selectedEmoji || "😷";
            emojiOptions.style.display = "none";
            updateTitleWithEmoji(selectedEmoji || "");
        });
    });

    const captureButton = document.getElementById("capture-button");
    captureButton?.addEventListener("click", () => {
        popupOverlay!.style.display = "none"; // Cache temporairement le formulaire
        activateCaptureMode(); // Lance le mode capture
    });

    const textInput = document.getElementById("text-input") as HTMLTextAreaElement;
    const submitArrow = document.getElementById("submit-arrow") as HTMLButtonElement;
    textInput.addEventListener("input", () => {
        submitArrow.disabled = textInput.value.trim() === "";
    });

    const closePopupButton = document.getElementById('close-popup');
    closePopupButton?.addEventListener('click', closeForm);
}

// Activation de la capture de zone avec bulle d'icône de capture
function activateCaptureMode(): void {
    createCaptureBubble(); // Créer et afficher la bulle de capture
    document.body.style.cursor = "crosshair";
    document.body.style.userSelect = "none";
    document.addEventListener("mousedown", startCapture);
}

// Désactiver le mode capture complètement
function disableCaptureMode() {
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
    removeCaptureBubble();

    // Retirer tous les écouteurs d'événements de la capture
    document.removeEventListener("mousedown", startCapture);
    document.removeEventListener("mousemove", updateSelectionBox);
    document.removeEventListener("mouseup", finishCapture);
}

// Démarrer la capture de zone
function startCapture(event: MouseEvent): void {
    event.preventDefault();
    startX = event.clientX;
    startY = event.clientY;

    if (selectionBox) selectionBox.remove();

    selectionBox = document.createElement("div");
    selectionBox.style.position = "absolute";
    selectionBox.style.border = "2px dashed #000";
    selectionBox.style.background = "rgba(0, 0, 0, 0.2)";
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.zIndex = "10000";
    document.body.appendChild(selectionBox);

    document.addEventListener("mousemove", updateSelectionBox);
    document.addEventListener("mouseup", finishCapture);
}

// Mettre à jour la boîte de sélection
function updateSelectionBox(event: MouseEvent): void {
    if (!selectionBox) return;
    const currentX = event.clientX;
    const currentY = event.clientY;
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${Math.min(startX, currentX)}px`;
    selectionBox.style.top = `${Math.min(startY, currentY)}px`;
}

// Terminer la capture de zone
function finishCapture(): void {
    disableCaptureMode(); // Désactiver le mode capture complètement

    if (selectionBox) {
        const rect = selectionBox.getBoundingClientRect();
        html2canvas(document.body, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            useCORS: true, // Active la prise en charge CORS
            allowTaint: false, // Évite les éléments externes non pris en charge
            //ignoreElements: (element: HTMLElement) => element.tagName === "VIDEO" || element.tagName === "IMG"
        }).then((canvas: HTMLCanvasElement) => {
            capturedImageUri = canvas.toDataURL("image/png"); // Enregistrer l'image capturée
            reopenPopupWithCapture(); // Rouvrir le formulaire avec l'image capturée en aperçu
            //const imageUri = canvas.toDataURL("image/png");
            //showCaptureForm(imageUri);
        }).catch((error: unknown) => {
            console.error("Erreur lors de la capture avec html2canvas :", error);
        });

        selectionBox.remove();
        selectionBox = null;
    }
}

// Rouvrir le formulaire après la capture avec l'aperçu de l'image
function reopenPopupWithCapture() {
    openPopup();
}
// Met à jour le titre en fonction de l'emoji sélectionné
function updateTitleWithEmoji(selectedEmoji: string) {
    const textElement = document.querySelector(".form-title")!;
    switch (selectedEmoji) {
        case "😐": textElement.textContent = "Quel problème rencontrez-vous ?"; break;
        case "😤": textElement.textContent = "Qu’est-ce qui vous agace ?"; break;
        case "😡": textElement.textContent = "Qu’est-ce qui vous énerve ?"; break;
        case "😞": textElement.textContent = "Qu’est-ce qui vous déçoit ?"; break;
        case "🤔": textElement.textContent = "Qu’est-ce qui vous rend confus ?"; break;
        case "😫": textElement.textContent = "Qu’est-ce qui vous épuise ?"; break;
        case "😵": textElement.textContent = "Qu’est-ce qui vous choque ?"; break;
        case "😟": textElement.textContent = "Qu'est-ce qui vous inquiète ?"; break;
        case "😖": textElement.textContent = "Pourquoi faites-vous cette grimace ?"; break;
        case "🤣": textElement.textContent = "Qu’est-ce qui vous fait marrer ?"; break;
        default: textElement.textContent = "À quoi réfléchissez-vous ?";
    }
}


// Afficher le formulaire avec l'image d'aperçu
function showCaptureForm(imageUri: string): void {
    if (isFormOpen || formOverlay) return;

    isFormOpen = true;
    formOverlay = document.createElement("div");
    formOverlay.style.position = "fixed";
    formOverlay.style.top = "0";
    formOverlay.style.left = "0";
    formOverlay.style.width = "100%";
    formOverlay.style.height = "100%";
    formOverlay.style.background = "rgba(0, 0, 0, 0.5)";
    formOverlay.style.display = "flex";
    formOverlay.style.justifyContent = "center";
    formOverlay.style.alignItems = "center";
    formOverlay.style.zIndex = "1001";

    const formContainer = document.createElement("div");
    formContainer.style.background = "white";
    formContainer.style.padding = "20px";
    formContainer.style.borderRadius = "10px";
    formContainer.style.textAlign = "center";

    // le style sur l'affichage de l'image preview
    const imgPreview = document.createElement("img");
    imgPreview.src = imageUri;
    imgPreview.style.width = "100px";
    imgPreview.style.height = "100px";
    imgPreview.style.marginBottom = "10px";

    const textArea = document.createElement("textarea");
    textArea.placeholder = "Décrivez votre problème...";
    textArea.style.width = "100%";
    textArea.style.height = "100px";

    const submitButton = document.createElement("button");
    submitButton.textContent = "Envoyer";
    submitButton.addEventListener("click", () => {
        alert("Message envoyé !");
        closeForm();
    });

    const closeButton = document.createElement("button");
    closeButton.textContent = "Fermer";
    closeButton.addEventListener("click", closeForm);

    formContainer.appendChild(imgPreview);
    formContainer.appendChild(textArea);
    formContainer.appendChild(submitButton);
    formContainer.appendChild(closeButton);
    formOverlay.appendChild(formContainer);
    document.body.appendChild(formOverlay);
    textArea.focus();

}

// Fermer le formulaire proprement
function closeForm() {
    if (popupOverlay) {
        popupOverlay.style.display = 'none';
        isFormOpen = false;
    }
}

// menu draggable 
function makeMenuDraggable(menu: HTMLDivElement): void {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function startDragging(e: MouseEvent): void {
        isDragging = true;
        offsetX = e.clientX - menu.getBoundingClientRect().left;
        offsetY = e.clientY - menu.getBoundingClientRect().top;

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", stopDragging);
    }

    function drag(e: MouseEvent): void {
        if (isDragging) {
            // Calculer les nouvelles positions
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;

            // Obtenir les dimensions de la fenêtre et du menu
            const menuRect = menu.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Limiter la position horizontale du menu (gauche-droite)
            newLeft = Math.max(0, Math.min(newLeft, windowWidth - menuRect.width));

            // Limiter la position verticale du menu (haut-bas)
            newTop = Math.max(0, Math.min(newTop, windowHeight - menuRect.height));

            // Appliquer les nouvelles coordonnées
            menu.style.left = `${newLeft}px`;
            menu.style.top = `${newTop}px`;
        }
    }

    function stopDragging(): void {
        isDragging = false;
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", stopDragging);
    }

    // Initier le déplacement avec "mousedown"
    menu.addEventListener("mousedown", startDragging);

    // Styles pour permettre le déplacement
    menu.style.position = "fixed";
    menu.style.cursor = "move";
    menu.style.top = "20px"; // Position de départ
    menu.style.left = "20px"; // Position de départ
}