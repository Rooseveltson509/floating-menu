export function openPopup(): void {
    const popupOverlay = document.createElement('div');
    popupOverlay.id = 'popup-overlay';
    popupOverlay.innerHTML = `
      <div class="form-container">
          <textarea placeholder="Décrivez votre problème..." id="text-input"></textarea>
          <button id="send-button">Envoyer</button>
          <button id="close-button">Fermer</button>
      </div>
    `;

    document.body.appendChild(popupOverlay);
    document.getElementById("close-button")!.onclick = () => closePopup(popupOverlay);
    document.getElementById("send-button")!.onclick = sendForm;
}

export function showCaptureForm(imageUri: string): void {
    // Code pour afficher le formulaire avec une image d'aperçu
    openPopup();
    const imgPreview = document.createElement("img");
    imgPreview.src = imageUri;
    document.querySelector(".form-container")?.appendChild(imgPreview);
}

function closePopup(popupOverlay: HTMLElement): void {
    popupOverlay.remove();
}

function sendForm(): void {
    // Code pour envoyer les données du formulaire
    alert("Formulaire envoyé !");
}
