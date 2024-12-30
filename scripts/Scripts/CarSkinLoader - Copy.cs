using UnityEngine;
using System;
using System.Runtime.InteropServices;
using System.Collections;

public class CarSkinLoader : MonoBehaviour
{
    // Referencia al SpriteRenderer del carro
    public SpriteRenderer carSpriteRenderer;
    public SpriteRenderer carShadowRenderer;

    [DllImport("__Internal")]
    private static extern void RequestCarNFTImage();

    void Start()
    {
        Debug.Log("[CarSkinLoader] Starting...");
        // Solo ejecutar en WebGL build
        #if UNITY_WEBGL && !UNITY_EDITOR
            Debug.Log("[CarSkinLoader] Requesting car image...");
            RequestCarNFTImage();
        #else
            Debug.Log("[CarSkinLoader] Not in WebGL build, skipping image request");
        #endif
    }

    // Esta función será llamada desde JavaScript
    public void OnImageReceived(string imageBase64)
    {
        Debug.Log("[CarSkinLoader] Image received, length: " + imageBase64.Length);
        try 
        {
            StartCoroutine(LoadCarSprite(imageBase64));
        }
        catch (Exception e)
        {
            Debug.LogError($"[CarSkinLoader] Error loading car sprite: {e.Message}");
        }
    }

    IEnumerator LoadCarSprite(string imageBase64)
    {
        Debug.Log("[CarSkinLoader] Converting base64 to texture...");
        try
        {
            // Convertir base64 a bytes
            byte[] imageBytes = Convert.FromBase64String(imageBase64);
            
            // Crear una textura desde los bytes
            Texture2D texture = new Texture2D(2, 2);
            bool success = texture.LoadImage(imageBytes);
            
            if (!success)
            {
                Debug.LogError("[CarSkinLoader] Failed to load image into texture");
                yield break;
            }

            Debug.Log($"[CarSkinLoader] Texture created: {texture.width}x{texture.height}");
            
            // Crear un sprite desde la textura
            Sprite carSprite = Sprite.Create(
                texture, 
                new Rect(0, 0, texture.width, texture.height),
                new Vector2(0.5f, 0.5f),
                100f // Pixels per unit
            );

            // Asignar el sprite al renderer
            if (carSpriteRenderer != null)
            {
                carSpriteRenderer.sprite = carSprite;
                // Rotar -90 grados y escalar al 60%
                carSpriteRenderer.transform.rotation = Quaternion.Euler(0, 0, -90);
                carSpriteRenderer.transform.localScale = Vector3.one * 0.6f;
                Debug.Log("[CarSkinLoader] Sprite assigned to car renderer with rotation and scale adjustments");
            }
            else
            {
                Debug.LogError("[CarSkinLoader] carSpriteRenderer is null");
            }

            // También actualizar la sombra si existe
            if (carShadowRenderer != null)
            {
                carShadowRenderer.sprite = carSprite;
                // Aplicar la misma rotación y escala a la sombra
                carShadowRenderer.transform.rotation = Quaternion.Euler(0, 0, -90);
                carShadowRenderer.transform.localScale = Vector3.one * 0.6f;
                Debug.Log("[CarSkinLoader] Sprite assigned to shadow renderer with rotation and scale adjustments");
            }
            else
            {
                Debug.LogError("[CarSkinLoader] carShadowRenderer is null");
            }
        }
        catch (Exception e)
        {
            Debug.LogError($"[CarSkinLoader] Error in LoadCarSprite: {e.Message}\n{e.StackTrace}");
        }

        yield return null;
    }
} 