let websocket = null,
    pluginUUID = null;

function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
{
    pluginUUID = inPluginUUID;

    // Open the web socket
    websocket = new WebSocket("ws://localhost:" + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the plugin
        const json = { "event": inRegisterEvent, "uuid": inPluginUUID };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt)
    {
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        console.log(jsonObj);
        
        if(jsonObj['event'] == "keyUp")
        {            
            let webhookurl = "";
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('webhookurl'))
                webhookurl = jsonObj.payload.settings["webhookurl"];
			
            let webhookbody = "";
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('webhookbody'))
                webhookbody = jsonObj.payload.settings["webhookbody"];
			
            let webhookcontenttype = "";
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('webhookcontenttype'))
                webhookcontenttype = jsonObj.payload.settings["webhookcontenttype"];
			
            let webhookmethod = "";
            if(jsonObj.payload.settings != null && jsonObj.payload.settings.hasOwnProperty('webhookmethod'))
                webhookmethod = jsonObj.payload.settings["webhookmethod"];

			console.log(webhookmethod + " " + webhookurl + ": Send " + webhookcontenttype + ":" + webhookbody);
		
            if(webhookurl == "" || webhookbody == "")
			{
                const json = { "event": "showAlert", "context": jsonObj.context };
                websocket.send(JSON.stringify(json));
            } else
			{
                const request = new XMLHttpRequest();
                request.open(webhookmethod, webhookurl);
				request.setRequestHeader('Content-Type', webhookcontenttype);
                request.send(webhookbody);
            }

        } else if(jsonObj['event'] == "keyDown")
		{
            const json = { "event": "getSettings", "context": pluginUUID };
    
            websocket.send(JSON.stringify(json));
        }
    };
};