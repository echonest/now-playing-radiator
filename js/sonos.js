
var _sonosIP = "192.168.1.105";
var _sonosID = "RINCON_000E5828B42A01400";
var _sonosName = "Office";

// Global variables that don't need to be customized to the environment.
var _soapRequestTemplate = '<?xml version="1.0" encoding="utf-8"?><s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"><s:Body>{0}</s:Body></s:Envelope>';
var _port = ':1400';
var _currentComposer = "";
var _currentAlbum = "";
var _currentAlbumArtURL = "";
var _currentTrack = "";
var RequestType = { "metadata": 0, "transport": 1, "playlists": 2, "oneplaylist": 3 };

// Refresh metadata.
function refreshCurrentlyPlaying() {
    // Set some globals to default.
    _currentAlbum = _currentArtist = _currentComposer, _currentAlbumArtURL = "";
    var url, xml, soapBody, soapAction;
    var host = _sonosIP + _port; 
    url = '/MediaRenderer/AVTransport/Control';
    soapAction = 'urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo';
    soapBody = '<u:GetPositionInfo xmlns:u="urn:schemas-upnp-org:service:AVTransport:1"><InstanceID>0</InstanceID><Channel>Master</Channel></u:GetPositionInfo>';
    xml = _soapRequestTemplate.replace('{0}', soapBody);
    // this is sync so it'll block
    sendSoapRequest(url, host, xml, soapAction, RequestType.metadata);
}

// Main Ajax request function. uPnP requests go through here.
// Here we use jQuery Ajax method because it does cross-domain without hassle.
function sendSoapRequest(url, host, xml, soapAction, requestType) {
    url = 'http://' + host + url;

    jQuery.ajax({
        url: url,
        type: "POST",
        async: false, // because we are just treating this like an API
        beforeSend: function (xhr) {
            xhr.setRequestHeader("SOAPAction", soapAction);
        },
        data: xml,
        success: function (data, status, xhr) {
            if (requestType == RequestType.metadata) {
                processSuccessfulAjaxRequestNodes_Metadata(jQuery(data).find("*"), host);
            }
        },
        complete: function (xhr, status) {
            var response = status || "no response text";
        },
        ajaxError: function (data) {
            var response = data || "no response text";
        },
        error: function (xhr, status, err) {  }
    });
}


function processSuccessfulAjaxRequestNodes_Metadata(responseNodes, host) {
    for (var i = 0; i < responseNodes.length; i++) {
        var currNodeName = responseNodes[i].nodeName;
        if (currNodeName == "TrackMetaData") {
            var responseNodes2 = jQuery(responseNodes[i].firstChild.nodeValue).find("*");
            var isStreaming = false;
            for (var j = 0; j < responseNodes2.length; j++) {
                switch (responseNodes2[j].nodeName) {
                    case "DC:CREATOR":
                        _currentComposer = XMLEscape.unescape(responseNodes2[j].firstChild.nodeValue);
                        break;
                    case "albumArtist":
                        _currentArtist = XMLEscape.unescape(responseNodes2[j].firstChild.nodeValue);
                    case "DC:TITLE":
                        _currentTrack = XMLEscape.unescape(responseNodes2[j].firstChild.nodeValue);
                        break;
                    case "UPNP:ALBUM":
                        _currentAlbum = XMLEscape.unescape(responseNodes2[j].firstChild.nodeValue);
                        break;
                    case "UPNP:ALBUMARTURI":
                        var newPath = XMLEscape.unescape(responseNodes2[j].firstChild.nodeValue);
                        newPath = (newPath.indexOf("http:") > -1) ? newPath : "http://" + host + newPath;
                        _currentAlbumArtURL = newPath;
                        break;
                } // end switch
            } // end for response
        } // end if trackmetadata block
    } 
}


//
// Utility
//

var XMLEscape = {
    escape: function (string) {
        return this.xmlEscape(string);
    },
    unescape: function (string) {
        return this.xmlUnescape(string);
    },
    xmlEscape: function (string) {
        string = string.replace(/&/g, "&amp;");
        string = string.replace(/"/g, "&quot;");
        string = string.replace(/'/g, "&apos;");
        string = string.replace(/</g, "&lt;");
        string = string.replace(/>/g, "&gt;");
        return string;
    },
    xmlUnescape: function (string) {
        string = string.replace(/&amp;/g, "&");
        string = string.replace(/&quot;/g, "\"");
        string = string.replace(/&apos;/g, "'");
        string = string.replace(/&lt;/g, "<");
        string = string.replace(/&gt;/g, ">");
        return string;
    }
};

    
