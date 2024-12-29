mergeInto(LibraryManager.library, {
    RequestCarNFTImage: function() {
        try {
            // Obtener el objeto CarSkinLoader
            var carSkinLoader = GameObject.Find("Car").GetComponent("CarSkinLoader");
            
            // Llamar a la función del frontend que maneja la solicitud
            window.RequestCarNFTImage(function(base64Image) {
                // Llamar de vuelta a Unity con la imagen
                carSkinLoader.SendMessage("OnImageReceived", base64Image);
            });
        } catch (error) {
            console.error('Error calling RequestCarNFTImage:', error);
        }
    }
}); 