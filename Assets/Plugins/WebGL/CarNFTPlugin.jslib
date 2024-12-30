var CarNFTPlugin = {
    RequestCarNFTImage: function() {
        try {
            console.log("[CarNFTPlugin] RequestCarNFTImage called");
            
            if (typeof window.RequestCarNFTImage !== 'function') {
                console.error("[CarNFTPlugin] window.RequestCarNFTImage is not a function");
                return;
            }

            window.RequestCarNFTImage(function(base64Image) {
                console.log("[CarNFTPlugin] Received image from frontend, length:", base64Image.length);
                try {
                    SendMessage("Car", "OnImageReceived", base64Image);
                    console.log("[CarNFTPlugin] Image sent to Unity successfully");
                } catch (sendError) {
                    console.error("[CarNFTPlugin] Error sending message to Unity:", sendError);
                }
            });
        } catch (error) {
            console.error("[CarNFTPlugin] Error in RequestCarNFTImage:", error);
        }
    }
};
mergeInto(LibraryManager.library, CarNFTPlugin); 