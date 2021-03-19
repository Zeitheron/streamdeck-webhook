let websocket = null,
    uuid = null,
    actionInfo = {};

function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo)
{

    uuid = inPropertyInspectorUUID;
    actionInfo = JSON.parse(inActionInfo);

    websocket = new WebSocket('ws://localhost:' + inPort);

    websocket.onopen = function()
    {
        // WebSocket is connected, register the Property Inspector
        let json = { "event": inRegisterEvent, "uuid": inPropertyInspectorUUID };
        websocket.send(JSON.stringify(json));

        json = { "event": "getSettings", "context": uuid };
        websocket.send(JSON.stringify(json));
    };

    websocket.onmessage = function (evt)
	{
        // Received message from Stream Deck
        const jsonObj = JSON.parse(evt.data);
        if(jsonObj.event === 'didReceiveSettings')
		{
            const payload = jsonObj.payload.settings;

            document.getElementById('webhookurl').value = payload.webhookurl;
            document.getElementById('webhookbody').value = payload.webhookbody;
            document.getElementById('webhookcontenttype').value = payload.webhookcontenttype;
            document.getElementById('webhookmethod').value = payload.webhookmethod;

            if(document.getElementById('webhookurl').value == "undefined")
                document.getElementById('webhookurl').value = "";
            if(document.getElementById('webhookbody').value == "undefined")
                document.getElementById('webhookbody').value = "";
            if(document.getElementById('webhookcontenttype').value == "undefined")
                document.getElementById('webhookcontenttype').value = "";
            if(document.getElementById('webhookmethod').value == "undefined")
                document.getElementById('webhookmethod').value = "";
			
			const el = document.querySelector('.sdpi-wrapper');
            el && el.classList.remove('hidden');
        }
    };

}

function updateInfo()
{
    if(websocket && (websocket.readyState === 1))
	{
        let payload = {};
        payload.webhookurl = document.getElementById('webhookurl').value;
        payload.webhookbody = document.getElementById('webhookbody').value;
        payload.webhookcontenttype = document.getElementById('webhookcontenttype').value;
        payload.webhookmethod = document.getElementById('webhookmethod').value;
        const json = { "event": "setSettings", "context": uuid, "payload": payload };
        websocket.send(JSON.stringify(json));
        console.log(json);
    }    
}

function openPage(site)
{
    if(websocket && (websocket.readyState === 1))
	{
        const json = { 'event': 'openUrl', 'payload': { 'url': 'https://' + site } };
        websocket.send(JSON.stringify(json));
    }
}

function testWebhook()
{
	const request = new XMLHttpRequest();
	request.open(document.getElementById('webhookmethod').value, document.getElementById('webhookurl').value);
    request.setRequestHeader('Content-Type', document.getElementById('webhookcontenttype').value);
	request.send(document.getElementById('webhookbody').value);
}