//////////////////////////////////////////////////////////////////////
// Eventification List Widget
// http://eventification.com
/////////////////////////////////////////////////////////////////////
;var JSON = {
  params : function(a1) { t = []; for(x in a1) t.push(x + "=" + encodeURI(a1[x])); return t.join("&"); }
};

function loadScript(url, callback) {
  var script    = document.createElement("script");
  script.type   = "text/javascript";
  script.src    = url;

  script.onload = function() {
    if (!script.onloadDone) {
      script.onloadDone = true;
      if(typeof callback == "function") callback();
    }
  };

  script.onreadystatechange = function() {
    if (("loaded" === script.readyState || "complete" === script.readyState ) && !domscript.onloadDone) {
      script.onloadDone = true;
      if(typeof callback == "function") callback();
    }
  };

  document.getElementsByTagName("head")[0].appendChild(script);
}

function loadStyles(url) {
  var styles   = document.createElement("link");
  styles.rel   = "stylesheet";
  styles.media = "screen";
  styles.type  = "text/css";
  styles.href  = url;

  document.getElementsByTagName("head")[0].appendChild(styles);
}

var data = {};
function storeEvents(d) { data = d; }

// Styles
loadStyles("../stylesheets/list.css");

// Allow namespacing
if(typeof evnt == "undefined" || typeof evnt.widget == "undefined") {
  var namespace = function(name, separator, container) {
    var ns = name.split(separator || '.'), o = container || window, i, len;
    for(i = 0, len = ns.length; i < len; i++) { o = o[ns[i]] = o[ns[i]] || {}; }
    return o;
  };
  namespace('evnt.widget');
}

//////////////////////////////////////////////////////////////////////
// List Widget
//
// Valid options:
//   title        - the header title for the widget (default: Upcoming Events)
//   eventOptions - options that affect the event list
//     starttime  - events after the specified time
//     endtime    - events before the specified time
//     tag        - events tagged with tag (e.g., social-media)
//     group_name - events in the group (e.g., Phoenix OpenCoffee Club)
//     venue_name - events at the venue (e.g., Lola Coffee)
//     owner      - events created by the user with the specified ID (e.g., 40)
//     latitude   - the latitude of the center point from which to find events
//     longitude  - the longitude of the center point from which to find events
//     radius     - event radius in miles (default: 10)
//     upcoming   - display only events in the future (default: true)
//
//////////////////////////////////////////////////////////////////////
evnt.widget.List = function(id, options) {
  var uid      = Math.floor(Math.random() * 10000);
  var el       = document.getElementById(id);
  var defaults = { title: "Upcoming Events" };

  if(typeof options == "undefined") options = {};

  // Insert the initial structure
  _initializeStructure(el);

  var params = JSON.params(options.eventOptions);
  if(params != "") params = '&' + params;
  loadScript('http://eventification.com/api/get/events?format=json&callback=storeEvents' + params, function() { _processEvents(); });

  function _initializeStructure(el) {
    var html = document.createElement('div');

    html.className = "evnt-list-widget-container";
    html.innerHTML = '<div class="evnt-list-widget-header"> \
  <h2 class="evnt-list-widget-header-title">' + (options.title || defaults.title) + '</h2> \
</div> \
<div id="evnt-list-widget-body-' + uid + '" class="evnt-list-widget-body"> \
  <div id="evnt-loading-' + uid + '" class="evnt-loading"> \
    <p>Loading events...</p> \
    <image src="../images/ajax-loader.gif" alt="" /> \
  </div> \
</div> \
<div class="evnt-list-widget-footer"> \
  <p> \
  Powered by \
    <a href="http://eventification.com/"> \
      <image src="../images/logo.jpg" alt="Eventification" title="Business and Technology Events in Phoenix, AZ" /> \
    </a> \
  </p> \
</div>';
    el.appendChild(html);
  }

  function _processEvents() {
    events = data.events;

    var body            = document.getElementById('evnt-list-widget-body-' + uid);
    var container       = document.createElement('div');
    container.className = 'evnt-list-event-container';

    if(events.length == 0) {
      var html = document.createElement('p');

      html.className = 'evnt-no-events';
      html.innerHTML = 'There are no events scheduled. Find more events at <a href="http://evnt.us/">Eventification</a>.';

      container.appendChild(html);
    } else {
      for(var i = 0; i < events.length; ++i) {
        _processEvent(container, events[i]);
      }
    }

    body.replaceChild(container, document.getElementById('evnt-loading-' + uid));
  }

  function _processEvent(container, event) {
    var html = document.createElement('div');

    var desc = event.description;
    if(desc.length > 200) {
      desc = event.description.substring(0,140) + '... [<a href="' + event.event_short_url + '">more</a>]';
    }

    html.className = 'evnt-event';
    html.innerHTML = '<h4 class="evnt-title"><a href="' + event.event_short_url + '">' + event.name + '</a></h4> \
<p class="evnt-details">' + event.formatted_time + '</p> \
<pre class="evnt-description">' + desc + '</pre>';

    if(event.url != "") {
      html.innerHTML += '<p class="evnt-url"><a href="' + event.url + '">More info</a></p>';
    }

    container.appendChild(html);
  }
};
