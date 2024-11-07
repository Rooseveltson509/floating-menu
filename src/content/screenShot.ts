// capture.ts
declare var html2canvas: any;
import { showCaptureForm } from './popup';

let selectionBox: HTMLDivElement | null = null;
let startX: number, startY: number;

export function activateCaptureMode(): void {
    document.body.style.cursor = "crosshair";
    document.addEventListener("mousedown", startCapture);
}

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

// Fonction pour mettre à jour la boîte de sélection
export function updateSelectionBox(event: MouseEvent): void {
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

// Fonction pour terminer la capture de la zone
function finishCapture(): void {
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";

    document.removeEventListener("mousemove", updateSelectionBox);
    document.removeEventListener("mouseup", finishCapture);

    if (selectionBox) {
        const rect = selectionBox.getBoundingClientRect();
        
        // Utiliser html2canvas pour capturer la zone
        html2canvas(document.body, {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        }).then((canvas: HTMLCanvasElement) => {
            const imageUri = canvas.toDataURL("image/png");
            showCaptureForm(imageUri); // Afficher l'image capturée dans le formulaire
        }).catch((error: unknown) => {
            console.error("Erreur lors de la capture avec html2canvas :", error);
        });

        selectionBox.remove();
        selectionBox = null;
    }
}
