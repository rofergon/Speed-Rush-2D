var CarNFTPlugin = {
    RequestCarNFTImage: function() {
        try {
            console.log("[CarNFTPlugin] RequestCarNFTImage called");
            
            if (typeof window.RequestCarNFTImage !== 'function') {
                console.error("[CarNFTPlugin] window.RequestCarNFTImage is not a function");
                return;
            }

            window.RequestCarNFTImage(function(base64Image) {
                console.log("[CarNFTPlugin] Imagen recibida del frontend");
                try {
                    SendMessage("Car", "OnImageReceived", base64Image);
                    console.log("[CarNFTPlugin] Imagen enviada a Unity exitosamente");
                } catch (sendError) {
                    console.error("[CarNFTPlugin] Error enviando imagen a Unity:", sendError);
                }
            });
        } catch (error) {
            console.error("[CarNFTPlugin] Error en RequestCarNFTImage:", error);
        }
    },

    UpdateCarStats: function(statsJson) {
        try {
            console.log("[CarNFTPlugin] Recibiendo estadísticas:", UTF8ToString(statsJson));
            SendMessage("Car", "SetCarStats", UTF8ToString(statsJson));
            console.log("[CarNFTPlugin] Estadísticas enviadas a Unity exitosamente");
        } catch (error) {
            console.error("[CarNFTPlugin] Error al actualizar estadísticas:", error);
        }
    }
};

mergeInto(LibraryManager.library, CarNFTPlugin); 