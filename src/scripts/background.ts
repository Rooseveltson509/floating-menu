chrome.action.onClicked.addListener((tab) => {
  console.log("L'icône de l'extension a été cliquée, activeTab est maintenant disponible.");

  // Envoyer un message au script de contenu pour capturer l'écran
  if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: "triggerCapture" });
  }
});

/* chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureTab") {
      console.log("Action 'captureTab' reçue.");

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0 || !tabs[0].id) {
              console.error("Aucun onglet actif trouvé.");
              sendResponse({ success: false, error: "Aucun onglet actif trouvé." });
              return;
          }

          // Capture de l'écran de l'onglet actif
          chrome.tabs.captureVisibleTab(tabs[0].windowId!, { format: "png" }, (imageUri) => {
              if (chrome.runtime.lastError) {
                  console.error("Erreur lors de la capture : ", chrome.runtime.lastError.message);
                  sendResponse({ success: false, error: chrome.runtime.lastError.message });
              } else {
                  console.log("Capture réussie !");
                  sendResponse({ success: true, imageUri: imageUri });
              }
          });

          return true; // Indique que la réponse est asynchrone
      });

      return true; // Indique que la réponse est asynchrone
  }
}); */

chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
  if (message.action === "captureTab") {
      // Obtenir l'ID de la fenêtre active
      chrome.windows.getCurrent({ populate: false }, (window) => {
          const windowId = window?.id;
          
          if (typeof windowId === "number") {
              // Capturer l'onglet si l'ID de la fenêtre est valide
              chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (dataUrl) => {
                  if (chrome.runtime.lastError) {
                      sendResponse({ success: false, error: chrome.runtime.lastError.message });
                  } else {
                      sendResponse({ success: true, dataUrl: dataUrl });
                  }
              });
          } else {
              // Envoyer une erreur si l'ID de la fenêtre est invalide
              sendResponse({ success: false, error: "ID de fenêtre non valide." });
          }
      });

      return true; // Permet la réponse asynchrone
  }
});



