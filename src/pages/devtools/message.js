(function() {
  var initialized    = false;
  var url            = '';
  var jQueryCache    = {};
  var isJST          = true;
  var times          = {};
  var timeZone       = '';
  var filter         = 'all';
  var search         = '';
  var sortedSupplies = [];
  var imageURL       = '../../assets/images/';
  var themeName      = '';
  var toggleRepeat   = false;

  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  var $supplyList = $('#supply-list');
  var $supplyItem = $supplyList.find('.supply-item').first().clone();
  $supplyList.find('.supply-item').first().remove();
  var $searchSupplies   = $('#search-supplies');
  var $supplyCategories = $('#supply-categories');
  var $firstCategory    = $supplyCategories.children('.active');
  var $currCategory = $firstCategory;
  var $trackerList = $('#supply-tracker-items');

  $('#supply-categories > li > a').click(function() {
    if ($(this).data('category') !== 'all') {
      search = '';
      $searchSupplies.val('');
    }
    filterSupplies($(this).data('category'));
    $currCategory = $(this).parent('li');
  });

  $('.tooltip-down').tooltip();

  var $raidsPanel        = $('#raids-panel');
  var $dailyRaidList     = $('#daily-raid-list');
  var $completedRaidList = $('#completed-raid-list');
  var $dailyRaid         = $dailyRaidList.find('.daily-quest-panel').first().clone();
  $dailyRaidList.find('.daily-quest-panel').first().remove();
  var $dailyRaidBig = $dailyRaidList.find('.daily-quest-panel').first().clone();
  $dailyRaidList.find('.daily-quest-panel').first().remove();

  var $dailyDistinctionList = $('#daily-distinction-list');
  var $dailyDistinction     = $dailyDistinctionList.find('.casino-div').first().clone();
  $dailyDistinctionList.find('.casino-div').first().remove();

  var $questCharactersPanel = $('#quest-characters-panel');
  var $questCharacter       = $('#quest-character').clone();
  $('#quest-character').remove();

  var $questEnemiesPanel = $('#quest-enemies-panel');
  var $questEnemy        = $('#quest-enemy').clone();
  $('#quest-enemy').remove();

  var $buffsPanel = $('#quest-buffs-panel');
  var $questBuff  = $('#quest-buff').clone();
  $('#quest-buff').remove();

  var $weaponPlanner = $('#weapon-planner-container');
  var $weaponType    = $('#weapon-type-container');
  var $weaponElement = $('#weapon-element-container');
  var $weaponStart   = $('#weapon-start-container');
  var $weaponEnd     = $('#weapon-end-container');

  var $repeatQuestIcon = $('#quest-repeat').find('.glyphicon-repeat');

  $searchSupplies.on('input paste', function(){
    if ($(this).val() !== '') {
      $currCategory.removeClass('active');
      $firstCategory.addClass('active');
      filter = 'all';
    }
    searchSupplies($(this).val());
    resetDropdowns();
  });

  $('#contents').find('.open-url').each(function() {
    $(this).click(function() {
      if ($(this).data('url') !== undefined && $(this).data('url') !== '') {
        Message.Post({ 'type': 'openURL', 'data': url + $(this).data('url') });
      }
    });
  });
  $('#quest-repeat').off('click').click(function(e) {
    if (e.shiftKey) {
      if (!$repeatQuestIcon.hasClass('glyphicon-refresh-animate')) {
        $repeatQuestIcon.addClass('glyphicon-refresh-animate');
        toggleRepeat = true;
      } else {
        $repeatQuestIcon.removeClass('glyphicon-refresh-animate')
        toggleRepeat = false;
      }
    } else {
      if ($(this).data('url') !== undefined && $(this).data('url') !== '') {
        Message.Post({ 'type': 'openURL', 'data': url + $(this).data('url') });
      }
    }
  });
  $('#contents').find('.copy-url').each(function() {
    $(this).click(function() {
      if ($(this).data('url') !== undefined && $(this).data('url') !== '') {
        copy($(this).data('url'));
      }
    });
  });

  $('#time-zone').click(function() {
    isJST = !isJST;
    if (isJST) {
      $(this).text('JST');
    } else {
      $(this).text(timeZone);
    }
    toggleTimes();
  });

  $('#bookmark-add').click(function() {
    Message.Post({ 'type': 'getURL', 'data': 'bookmark' });
  });

  var dropdownHash = {
    'Revenant': {
      'element' : ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark'],
      'start' :   ['Awakening', 'Element', 'Upgrade 1', 'Upgrade 2', 'Upgrade 3', 'Upgrade 4', 'Upgrade 5', 'Upgrade 6'],
      'end' :     ['Awakening', 'Element', 'Upgrade 1', 'Upgrade 2', 'Upgrade 3', 'Upgrade 4', 'Upgrade 5', 'Upgrade 6']
    },
    'Class': {
      'type':     ['Avenger', 'Skofnung', 'Nirvana', 'Keraunos', 'Oliver', 'Hellion', 'Ipetam', 'Rosenbogen', 'Langeleik', 'Romulus', 'Faust', 'Murakumo', 'Muramasa', 'Ascalon', 'Nebuchad', 'Kapilavastu' ,'Misericorde'],
      'element' : ['Fire', 'Water', 'Earth', 'Wind', 'Light', 'Dark'],
      'start' :   ['Redeem', 'Forge', 'Rebuild', 'Element'],
      'end' :     ['Redeem', 'Forge', 'Rebuild', 'Element']
    },
    'Seraph': {
      'element' : ['Fire', 'Water', 'Earth', 'Wind'],
      'start' :   ['Forge', 'Uncap 1', 'Uncap 2', 'Uncap 3', 'SSR Upgrade'],
      'end' :     ['Forge', 'Uncap 1', 'Uncap 2', 'Uncap 3', 'SSR Upgrade']
    },
    'Bahamut': {
      'type':  ['Sabre', 'Dagger', 'Spear', 'Axe', 'Staff', 'Gun', 'Melee', 'Bow', 'Harp', 'Katana'],
      'start': ['Core', 'Nova', 'Coda'],
      'end':   ['Core', 'Nova', 'Coda']
    },
    'Revenant 5*': {
      'type':  ['Uno', 'Song', 'Sarasa', 'Quatre', 'Funf', 'Six', 'Siete', 'Octo', 'Nio', 'Esser'],
      'start': ['Silver Forge', 'Silver 4*', 'Gold Forge', 'Character 5*'],
      'end':   ['Silver Forge', 'Silver 4*', 'Gold Forge', 'Character 5*']
    }
  };
  var dropdownLocater = {
    'planner': $weaponPlanner,
    'type':    $weaponType,
    'element': $weaponElement,
    'start':   $weaponStart,
    'end':     $weaponEnd
  };

  var weaponBuild = {};
  var weaponType  = '';

  var resetDropdowns = function() {
    $weaponPlanner.find('.dropdown-text').text('Planner');
    $weaponType.find('.dropdown-text').text('Type');
    $weaponElement.find('.dropdown-text').text('Element');
    $weaponStart.find('.dropdown-text').text('Current');
    $weaponEnd.find('.dropdown-text').text('Target');
    $weaponType.hide();
    $weaponElement.hide();
    $weaponStart.hide();
    $weaponEnd.hide();
  };
  var initializeDropdowns = function(type) {
    Object.keys(dropdownHash[type]).forEach(function(key) {
      var values = dropdownHash[type][key];
      $('#weapon-' + key + '-container').show();
      $('#weapon-' + key + '-dropdown').find('a').each(function(index) {
        if (index < values.length) {
          $(this).show();
          $(this).text(values[index]);
        } else {
          $(this).hide();
        }
      });
    });
  };
  $('#weapon-planner-dropdown').find('a').each(function() {
    var $this = $(this);
    $this.click(function() {
      resetDropdowns();
      clearPlanner();
      weaponBuild = {};
      weaponType  = $this.text();
      initializeDropdowns(weaponType);
      Object.keys(dropdownHash[weaponType]).forEach(function(key) {
        weaponBuild[key] = null;
      });
      Message.Post({ 'type': 'getPlanner', 'data': $this.text() });
    });
  });

  $('#weapon-dropdowns').find('.dropdown').each(function() {
    var btn = $(this).find('.dropdown-text').first();
    $(this).find('a').each(function(index) {
      var $this = $(this);
      $this.click(function() {
        btn.text($this.text());
        if (weaponType && weaponBuild[$this.data('weapon')] !== undefined) {
          if ($this.data('weapon') === 'start' || $this.data('weapon') === 'end') {
            weaponBuild[$this.data('weapon')] = index;
          } else {
            weaponBuild[$this.data('weapon')] = $this.text();
          }
          var keys = Object.keys(weaponBuild);
          for (var i = 0; i < keys.length; i++) {
            if (weaponBuild[keys[i]] === null) {
              return;
            }
          }
          Message.Post({
            'type': 'weaponBuild',
            'data': {
              'type':  weaponType,
              'build': weaponBuild
            }
          });
          //all options selected; publish weapon event with params
        }
      });
    });
  });

  resetDropdowns();

  var messages = [
    'Click every panel!',
    'Don\'t give up, skeleton!',
    'Bugs, questions, comments, or\nrecommendations? Email them to\nancheeraextension@gmail.com',
    'Desire sensor is real',
    'You have a 100% chance to get\nanything in the gacha if you\nthrow enough $$$$$ at it',
    'goodwork.png',
    ':thinking:',
    'Something\'s not quite right...',
    'RIP in peace HRT',
    'buying gf',
    'plz fame me',
    'Don\'t let your memes be dreams',
    '(´･ω･`)',
    'Thank you for your support!',
    'The pleasure is mine',
    'Roll the bones',
    'Drop rate buffs are a placebo',
    'Get bond',
    'Ravioli ravioli give\nme the formuoli',
    'Nothing personnel, kid',
    'm\'lady',
    'Wake me up inside\n(I can\'t wake up)',
    'My name is Shackleford.\nRusty Shackleford.'
  ];

  var message  = messages[Math.floor(Math.random() * messages.length)];
  var $message = $('#message');

  var setMessage = function(msg) {
    $message.text(msg);
  };
  setMessage(message);

  var backgroundPageConnection = chrome.runtime.connect({
    name: 'devtools'
  });
  backgroundPageConnection.postMessage({
    'type': 'connect',
    'data': chrome.devtools.inspectedWindow.tabId
  });

  var copy = function(str) {
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = str;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
  };

  var processUIUpdate = function (message) {
    if (message === undefined || message === null) {
      return;
    }

    var type = message.type;
    var data = message.data;

    switch (type) {
      case 'setText':
        setText(data.id, data.value);
        break;
      case 'setImage':
        setImage(data.id, data.value);
        break;
      case 'setHeight':
        setHeight(data.id, data.value);
        break;
      case 'setBar':
        setBar(data.id, data.value);
        break;
      case 'setColor':
        setColor(data.id, data.value);
        break;
      case 'setTime':
        setTime(data.id, data.jst, data.normal);
        break;
      case 'setTimeZone':
        timeZone = data;
        break;
      case 'addItem':
        addItem(data.id, data.category, data.number, data.name, data.sequence, data.tooltip, data.track);
        break;
      case 'hideObject':
        hideObject(data.id, data.value);
        break;
      case 'addQuest':
        addQuest(data.id, data.url, data.name, data.amount, data.max, data.animeIDs, data.animeAmounts);
        break;
      case 'addDistinction':
        addDistinction(data.id, data.amount, data.max, data.isEnabled);
        break;
      case 'setAlert':
        setAlert(data.id, data.time, data.text);
        break;
      case 'collapsePanel':
        collapsePanel(data.id, data.value);
        break;
      case 'appendObject':
        appendObject(data.id, data.target);
        break;
      case 'beforeObject':
        beforeObject(data.id, data.target);
        break;
      case 'addQuestCharacter':
        addQuestCharacter(data.index);
        break;
      case 'addQuestEnemy':
        addQuestEnemy(data.index);
        break;
      case 'setOpacity':
        setOpacity(data.id, data.value);
        break;
      case 'setClick':
        setClick(data.id, data.value);
        break;
      case 'setTheme':
        setTheme(data);
        break;
      case 'setMessage':
        setMessage(data);
        break;
      case 'generatePlanner':
        generatePlanner(data);
        break;
      case 'setPlannerItemAmount':
        setPlannerItemAmount(data.id, data.sequence, data.current);
        break;
      case 'setPlannerDropdowns':
        setPlannerDropdowns(data.type, data.build);
        break;
      case 'setTooltip':
        setTooltip(data.id, data.text);
        break;
      case 'setOption':
        setOption(data.id, data.value);
        break;
      case 'addTrackItem':
        addTrackItem(data.id, data.sequence, data.category, data.name, data.tooltip);
        break;
      case 'removeTrackItem':
        removeTrackItem(data.id);
        break;
      case 'bookmarkURL':
        // TODO: clean this shit up and make it work
        //<li class="casino-div">
        //<div class="open-url" data-url="#shop/exchange/points"></div>
        $("#collapse-bookmarks > ul").append(
          $('<li/>', {
            'class': 'casino-div'
          }).append(
            $('<div/>', {
              'class': 'open-url',
              'data-url': data,
              'text': 'bookmark'
            }).click(function () {
              if ($(this).data('url') !== undefined && $(this).data('url') !== '') {
                Message.Post({ 'type': 'openURL', 'data': url + $(this).data('url') });
              }
            })
            )
        );
        break;
      case 'autoRepeat':
        if (toggleRepeat) {
          if (jQueryCache['#quest-repeat'] === undefined) {
            jQueryCache['#quest-repeat'] = $('#quest-repeat');
          }
          if (jQueryCache['#quest-repeat'].data('url') !== undefined && jQueryCache['#quest-repeat'].data('url') !== '') {
            Message.Post({ 'type': 'openURL', 'data': url + jQueryCache['#quest-repeat'].data('url') });
          }
        }
        break;
      default:
        console.log('Unhandled message type: ' + type);
        break;
    }
  }

  backgroundPageConnection.onMessage.addListener(function (message, sender) {
    if (message === undefined || message === null) {
      return;
    }

    var type = message.type;
    var data = message.data;

    switch (type) {
      case 'pageLoad':
        if (!initialized &&
          (data.indexOf('http://gbf.game.mbga.jp/') !== -1 || data.indexOf('http://game.granbluefantasy.jp/') !== -1)) {
          Message.Post({ 'type': 'initialize', 'data': true });
        }
        break;
      case 'initialize':
        if (!initialized) {
          initialized = true;
          for (var i = 0; i < data.length; i++) {
            processUIUpdate(data[i]);
          }
          $('#wait').hide();
          if (themeName !== 'Vira' && themeName !== 'Narumaya') {
            $('#contents').show();
          }
        }
        break;
      case 'setBaseURL':
        url = data;
        break;
      case 'openURL':
        Message.Post({ 'type': 'openURL', 'data': url + message.openURL });
        break;
      case 'logItem':
        logItem(data);
        break;
      default:
        processUIUpdate(message);
        break;
    }
  });

  var setText = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].text(value);
  };
  var setImage = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].attr('src', value);
  };
  var setHeight = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].height(value);
  };
  var setOpacity = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].fadeTo('fast', value);
  };
  var hideObject = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    if (value) {
      jQueryCache[id].hide();
    } else {
      jQueryCache[id].show();
    }
  };
  var setBar = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].css('width', value);
  };
  var setColor = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].css('background-color', value);
  };
  var setTime = function(id, jstTime, normalTime) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    times[id] = {
      'jst':    jstTime,
      'normal': normalTime
    };
    if (isJST) {
      jQueryCache[id].text(jstTime);
    } else {
      jQueryCache[id].text(normalTime);
    }
  };
  var collapsePanel = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }

    if (value && jQueryCache[id].hasClass('collapse in')) {
      jQueryCache[id].collapse('hide');
    } else if (!value && !jQueryCache[id].hasClass('collapse in')) {
      jQueryCache[id].collapse('show');
    }
  };
  var appendObject = function(id, targetID) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    if (jQueryCache[targetID] === undefined) {
      jQueryCache[targetID] = $(targetID);
    }

    jQueryCache[targetID].append(jQueryCache[id]);
  };
  var setClick = function(id, value) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].data('url', value);
    if (value !== '') {
      jQueryCache[id].addClass('open-url');
    } else {
      jQueryCache[id].removeClass('open-url');
    }
  };
  var setTooltip = function(id, text) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].attr('title', text).tooltip('fixTitle');
    if ($('.tooltip').length > 0 && $('.tooltip').prev().prop('id') == id.substring(1)) {
      jQueryCache[id].tooltip('show');
    }
  };
  var beforeObject = function(id, targetID) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    if (jQueryCache[targetID] === undefined) {
      jQueryCache[targetID] = $(targetID);
    }
    jQueryCache[targetID].before(jQueryCache[id]);
  };
  var addItem = function(id, category, number, name, sequence, tooltip, track) {
    var newItem = $supplyItem.clone();
    var itemExists = true;
    newItem.attr('id', 'supply-' + sequence + '-' + id);
    if (category === 'recovery' || category === 'draw' || category === 'powerUp') {
      newItem.data('category', 'misc');
    } else {
      newItem.data('category', category);
    }

    newItem.data('item-category', category);
    newItem.data('item-id', id);
    newItem.click(function () {
      if ($(this).data('item-category') !== undefined && $(this).data('item-category') !== '') {
        if ($(this).data('item-id') !== undefined && $(this).data('item-id') !== '') {
          Message.Post({
            'type': 'toggleTracking',
            'data': {
              'category': $(this).data('item-category'),
              'id': $(this).data('item-id')
            }
          });
        }
      }
    });

    if ((filter !== 'all' && filter !== category) || name.toLowerCase().indexOf(search) === -1) {
      newItem.hide();
    }

    newItem.data('name', name.toLowerCase());
    var imgURL;
    if (category === 'recovery') {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/normal/s/';
    } else if (category === 'powerUp') {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/evolution/s/';
    } else if (category === 'skillPlus') {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/skillplus/s/';
    } else if (category === 'npcAugment') {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/npcaugment/s/';
    } else if (category === 'draw') {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/ticket/';
    } else {
      imgURL = 'http://game-a.granbluefantasy.jp/assets_en/img/sp/assets/item/article/s/';
    }

    imgURL += id + '.jpg';
    newItem.children('.item-img').first().attr('src', imgURL);
    newItem.children('.item-img').on('error', function () {
      Message.Post({ 'type': 'removeItem', 'data': $(this).attr('src') });
      $(this).remove();
    });
    newItem.children('.item-count').first().text(number);
    newItem.children('.item-count').first().attr('id', 'supply-' + sequence + '-' + id + '-count');
    var tooltipText;
    if (tooltip !== undefined) {
      tooltipText = tooltip;
    } else {
      tooltipText = name;
    }

    newItem.prop('title', tooltipText);
    newItem.tooltip();

    var low  = 0;
    var high = sortedSupplies.length;
    while (low < high) {
      var mid = low + high >>> 1;
      if (sortedSupplies[mid].sequence < parseInt(sequence)) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    if (low < sortedSupplies.length) {
      $supplyList.children('#supply-' + sortedSupplies[low].sequence + '-' + sortedSupplies[low].id).before(newItem);
      sortedSupplies.splice(low, 0, {
        'sequence': parseInt(sequence),
        'id':       parseInt(id)
      });
    } else {
      $supplyList.append(newItem);
      sortedSupplies.push({
        'sequence': parseInt(sequence),
        'id':       parseInt(id)
      });
    }

    if (track) {
      addTrackItem(id, sequence, category, name, tooltip);
    }
  };
  var addTrackItem = function (id, sequence, category, name, tooltip) {
    var elid = '#supply-' + sequence + '-' + id;
    if (jQueryCache[elid] === undefined) {
      jQueryCache[elid] = $(elid);
    }
    if (!jQueryCache[elid].length) {
      return;
    }
    var newItem = jQueryCache[elid].clone();
    newItem.attr('id', 'supply-track-' + sequence + '-' + id);
    newItem.data('item-category', category);
    newItem.data('item-id', id);
    newItem.click(function () {
      if ($(this).data('item-category') !== undefined && $(this).data('item-category') !== '') {
        if ($(this).data('item-id') !== undefined && $(this).data('item-id') !== '') {
          Message.Post({
            'type': 'toggleTracking',
            'data': {
              'category': $(this).data('item-category'),
              'id': $(this).data('item-id')
            }
          });
        }
      }
    });

    newItem.children('.item-count').first().attr('id', 'supply-track-' + sequence + '-' + id + '-count');

    $trackerList.append(newItem);

    var tooltipText;
    if (tooltip !== undefined) {
      tooltipText = tooltip;
    } else {
      tooltipText = name;
    }
    newItem.attr('title', tooltipText).attr('data-original-title', tooltipText).tooltip('fixTitle');
  };
  var removeTrackItem = function (id) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].removeData('tooltip').unbind().next('div.tooltip').remove();
    jQueryCache[id].remove();
    delete jQueryCache[id];
  };
  var setAlert = function(id, time, text) {
    if (jQueryCache[id] === undefined) {
      jQueryCache[id] = $(id);
    }
    jQueryCache[id].text(text);
    jQueryCache[id].animate({ top: '0' });
    setTimeout(function(){ jQueryCache[id].animate({ top: '-100px' }); }, time);
  };
  var logItem = function (data) {
    if (data.items && !jQuery.isEmptyObject(data.items)) {
      var date = new Date(data.time);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var time = hours + ':' + minutes + ' ' + ampm;

      $('#log-container').append(
        $('<div/>', {
          'class': 'log'
        }).append(
          $('<span/>', {
            'class': 'log-date',
            'text': months[date.getMonth()] + ' ' + date.getDate() + ' ' + time
          })
        )
      );
      for (var i in data.items) {
        if (!data.items.hasOwnProperty(i)) continue;
        for (var j in data.items[i]) {
          if (!data.items[i].hasOwnProperty(j)) continue;
          var chesturl = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          if (i !== '0' && i !== '99') {
            chesturl = '../../assets/images/icons/chest-' + i + '.png'
          }
          var logtext = ''
          if (data.items[i][j].name) {
            logtext = data.items[i][j].name;
          } else {
            logtext = 'itemid:' + j;
          }
          $('#log-container').append(
            $('<div/>', {
              'class': 'log'
            }).append(
              $('<img/>', {
                'class': 'log-item-chest',
                'src': chesturl
              })
            ).append(
              $('<span/>', {
                'class': 'log-item',
                'text': data.items[i][j].qty + 'x ' + logtext + ' obtained.'
              })
            )
          ).scrollTop(function () { return this.scrollHeight; });
        }
      }
    }
  };

  var $plannerItem = $('.weapon-item').first().clone();
  $('.weapon-item').remove();
  var $plannerIncompleteList = $('#weapon-item-incomplete');
  var $plannerCompleteList   = $('#weapon-item-complete');
  var incompleteActiveCount  = 0;
  var completeActiveCount    = 0;

  var generatePlanner = function(planner) {
    var incompleteCount = 0;
    var completeCount = 0;
    var $incompleteItems = $plannerIncompleteList.children('.weapon-item');
    var $completeItems = $plannerCompleteList.children('.weapon-item');
    if (planner.length === 0) {
      clearPlanner();
      return;
    }
    for (var i = 0; i < planner.length; i++) {
      var item = planner[i];
      var $list;
      var $items;
      var count;

      if (item.current < item.total) {
        $list  = $plannerIncompleteList;
        $items = $incompleteItems;
        count  = incompleteCount;
        incompleteCount++;
      } else {
        $list  = $plannerCompleteList;
        $items = $completeItems;
        count  = completeCount;
        completeCount++;
      }
      if (count >= $items.length) {
        addPlannerItem($list, item.id, item.category, item.current, item.total, item.sequence, item.tooltip);
      } else {
        updatePlannerItem($($items.get(count)), item.id, item.category, item.current, item.total, item.sequence, item.tooltip);
      }
    }
    $($incompleteItems.get().reverse()).each(function(i) {
      if ($incompleteItems.length - 1 - i >= incompleteCount) {
        $(this).hide();
      } else {
        return false;
      }
    });
    $($completeItems.get().reverse()).each(function(i) {
      if ($completeItems.length - 1 - i >= completeCount) {
        $(this).hide();
      } else {
        return false;
      }
    });
  };

  var addPlannerItem = function($list, id, category, current, total, sequence, tooltip) {
    var newItem = $plannerItem.clone();
    setPlannerItem(newItem, id, category, current, total, sequence, tooltip);
    $list.append(newItem);
  };

  var updatePlannerItem = function($item, id, category, current, total, sequence, tooltip) {
    $item.show();
    setPlannerItem($item, id, category, current, total, sequence, tooltip);
  };

  var setPlannerItem = function($item, id, category, current, total, sequence, tooltip) {
    $item.attr('id', 'planner-' + sequence + '-' + id);
    $item.data('sequence', sequence);
    $item.data('category', category);
    var imgURL;
    if (category === 'recovery') {
      imgURL = 'http://gbf.game-a.mbga.jp/assets_en/img/sp/assets/item/normal/s/';
    } else if (category === 'powerUp') {
      imgURL = 'http://gbf.game-a.mbga.jp/assets_en/img/sp/assets/item/evolution/s/';
    } else if (category === 'draw') {
      imgURL = 'http://gbf.game-a.mbga.jp/assets_en/img/sp/assets/item/ticket/';
    } else {
      imgURL = 'http://gbf.game-a.mbga.jp/assets_en/img/sp/assets/item/article/s/';
    }
    imgURL += id + '.jpg';
    if (category === 'currency') {
      if (id === 'crystal') {
        imgURL = '../../assets/images/icons/crystal.png';
      }
    }
    $item.children('.item-img').first().attr('src', imgURL);
    var $current = $item.find('.item-current').first();
    var $total   = $item.find('.item-total').first();
    $current.text(truncateNumber(current));
    $current.data('value', current);
    $current.attr('id', 'planner-' + sequence + '-' + id + '-current');
    $total.text(total);
    $total.data('value', total);
    $total.attr('id', 'planner-' + sequence + '-' + id + '-total');
    $item.tooltip('hide')
      .attr('data-original-title', tooltip)
      .tooltip('fixTitle');
  };

  var setPlannerItemAmount = function(id, sequence, current) {
    var $item = $('#planner-' + sequence + '-' + id);
    if ($item.length > 0) {
      var $current = $item.find('#planner-' + sequence + '-' + id + '-current');
      $current.text(truncateNumber(current));
      $current.data('value', current);
      var incomplete = ($plannerIncompleteList.children('#planner-' + sequence + '-' + id).length > 0);
      var total      = parseInt($item.find('#planner-' + sequence + '-' + id + '-total').data('value'));
      if (!incomplete && current < total) {
        $plannerIncompleteList.append($item);
        $plannerIncompleteList.children('.weapon-item').sort(sortPlanner).appendTo($plannerIncompleteList);
      } else if (incomplete && current >= total) {
        $plannerCompleteList.append($item);
        $plannerCompleteList.children('.weapon-item').sort(sortPlanner).appendTo($plannerCompleteList);
      }
    }
  };

  var setPlannerDropdowns = function(type, build) {
    dropdownLocater['planner'].find('.dropdown-text').text(type);
    initializeDropdowns(type);
    weaponType  = type;
    weaponBuild = build;
    Object.keys(build).forEach(function(key) {
      dropdownLocater[key].show();
      if (key === 'start' || key === 'end') {
        dropdownLocater[key].find('.dropdown-text').text(dropdownHash[type][key][build[key]]);
      } else {
        dropdownLocater[key].find('.dropdown-text').text(build[key]);
      }
    });
  };

  var clearPlanner = function() {
    $plannerIncompleteList.children('.weapon-item').hide();
    $plannerCompleteList.children('.weapon-item').hide();
  };

  var truncateNumber = function(value) {
    if (value >= 1000000) {
      return Math.round(value / 100000) + 'M';
    } else if (value >= 10000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  };

  var sortPlanner = function(a, b) {
    var $a = $(a);
    var $b = $(b);
    if ($a.data('category') === $b.data('category')) {
      return parseInt($a.data('sequence')) - parseInt($b.data('sequence'));
    } else {
      var categoryHash = {
        treasure: 0,
        raid:     1,
        material: 2,
        event:    3,
        coop:     4,
        misc:     5,
        recovery: 6,
        powerUp:  7,
        draw:     8,
        other:    9,
        currency: 10
      };
      return categoryHash[$a.data('category')] - categoryHash[$b.data('category')];
    }
  };

  var addQuest = function(id, imgUrl, name, amount, max, animeIDs, animeAmounts) {
    var newRaid;
    if (animeIDs !== null && animeIDs.length > 1) {
      newRaid = $dailyRaidBig.clone();
      newRaid.find('.open-url').each(function(i) {
        $(this).click(function() {
          Message.Post({ 'type': 'openURL', 'data': url + '#quest/supporter/' + id + '/1/0/' + animeIDs[i] });
        });
      });
    } else {
      newRaid = $dailyRaid.clone();
      var raidUrl = url + '#quest/supporter/' + id + '/1';
      if (animeIDs !== null) {
        raidUrl += '/0/' + animeIDs[0];
      }
      newRaid.click(function() {
        Message.Post({ 'type': 'openURL', 'data': raidUrl });
      });
    }
    newRaid.data('id', id);
    newRaid.attr('id', 'daily-raid-' + id);
    newRaid.find('.quest-img').first().attr('src', imgUrl);
    newRaid.find('.quest-name').first().text(name);
    newRaid.find('.quest-count').first().attr('id', 'remaining-' + id);
    newRaid.find('.quest-count').first().data('id', id);
    newRaid.find('.quest-count').first().text(amount + '/' + max);
    if (animeIDs !== null) {
      newRaid.find('.item-img').each(function(i) {
        $(this).attr('src', imageURL + 'items/' + animeIDs[i] + '.jpg');
      });
      newRaid.find('.item-count').each(function(i) {
        $(this).text(animeAmounts[i]);
        $(this).addClass('anime-count-' + animeIDs[i]);
      });
    } else {
      newRaid.children('.quest-item').first().remove();
    }
    $dailyRaidList.append(newRaid);
  };
  var addDistinction = function(id, amount, max, isEnabled) {
    var newDistinction = $dailyDistinction.clone();
    newDistinction.data('id', id);
    newDistinction.attr('id', 'distinctions-body-' + id);
    newDistinction.find('.item-img').first().attr('src', imageURL + 'items/' + id + '.jpg');
    newDistinction.find('.item-count').first().attr('id', 'dailies-distinctions-' + id);

    $dailyDistinctionList.append(newDistinction);
    if (!isEnabled) {
      newDistinction.hide();
    }
  };

  var addQuestCharacter = function(index) {
    var newCharacter = $questCharacter.clone();
    newCharacter.attr('id', 'quest-character-' + index);
    newCharacter.find('.quest-character-image').attr('id', 'quest-character-image-' + index);
    newCharacter.find('.quest-skill').each(function(i) {
      $(this).attr('id', 'quest-skill-' + index + '-' + i);
      $(this).find('.quest-skill-image').attr('id', 'quest-skill-image-' + index + '-' + i);
      $(this).find('.quest-skill-text').attr('id', 'quest-skill-text-' + index + '-' + i);
    });
    newCharacter.find('.quest-character-buffs').attr('id', 'quest-character-buffs-' + index);
    $questCharactersPanel.append(newCharacter);
  };

  var addQuestEnemy = function(index) {
    var newEnemy = $questEnemy.clone();
    newEnemy.attr('id', 'quest-enemy-' + index);
    newEnemy.find('.quest-enemy-image').attr('id', 'quest-enemy-image-' + index);
    newEnemy.find('.quest-enemy-buffs').attr('id', 'quest-enemy-buffs-' + index);
    $questEnemiesPanel.append(newEnemy);
  };

  var filterSupplies = function(category) {
    filter = category;
    $supplyList.children().each(function(index) {
      if (category === $(this).data('category') || category === 'all') {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  };

  var searchSupplies = function(query) {
    search = query.toLowerCase();
    $supplyList.children().each(function(index) {
      if ($(this).data('name').indexOf(search) !== -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  };

  var hideAllSupplies = function() {
    $supplyList.children().each(function(index) {
      $(this).hide();
    });
  };

  var toggleTimes = function() {
    Object.keys(times).forEach(function(key) {
      if (isJST) {
        jQueryCache[key].text(times[key].jst);
      } else {
        jQueryCache[key].text(times[key].normal);
      }
    });
  };

  var setTheme = function(theme) {
    Message.Post({ 'type': 'consoleLog', 'data': theme });
    var sheetURL = '../../stylesheets/';
    var $bars = $('.progress-bar');
    if (theme === 'Tiamat Night') {
      sheetURL += 'night';
      if ($bars.hasClass('progress-bar-danger')) {
        $bars.removeClass('progress-bar-danger').addClass('progress-bar-custom');
      }
      $('rect[id=\'mask-fill\']').css('fill', '#2a2a2a');
    }
    else if (theme === 'Vira') {
      sheetURL += 'garbage1';
    }
    else if (theme === 'Narumaya') {
      sheetURL += 'garbage2';
    }
    else {
      sheetURL += 'default';
      if ($bars.hasClass('progress-bar-custom')) {
        $bars.removeClass('progress-bar-custom').addClass('progress-bar-danger');
      }
      $('rect[id=\'mask-fill\']').css('fill', '#f5f5f5');
    }
    if (theme === 'Vira' || theme === 'Narumaya') {
      $('#contents').hide();
      $('#wait').hide();
      $('#garbage').show();
    } else {
      $('#garbage').hide();
      if (initialized) {
        $('#contents').show();
        $('#wait').hide();
      } else {
        $('#contents').hide();
        $('#wait').show();
      }
    }
    sheetURL += '.css';
    document.getElementById('pagestyle').setAttribute('href', sheetURL);
    themeName = theme;
  };

  var setOption = function (id, value) {
    options[id] = value;
  }

  window.Message = {
    Post: function(message) {
      message.id = chrome.devtools.inspectedWindow.tabId;
      backgroundPageConnection.postMessage(message);
    },
    Copy: function(str) {
      copy(str);
    }
  };

  Message.Post({ 'type': 'devAwake', 'data': true });
})();
