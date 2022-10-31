(function() {
  $(window).on('beforeunload', function() {
    //chrome.runtime.sendMessage({ refresh: true });
  });

  var tempImageURLS = {},
    gameState = {
      'turn': -1,
      'ability_turn': -1,
      'raid_id': null,
      'enemies': [null, null, null]
    },
    syncInit = false,
    options = {
      'copyJapaneseName': false,
      'syncAll': false,
      'syncTurns': false,
      'syncAbilityTurns': false,
      'syncBossHP': false,
      'syncPlayerHP': false,
      'syncPotions': false,
      'syncAbilities': false,
      'syncSummons': false,
      'syncPlayerFormation': false,
      'fasterRefresh': false,
      'alwaysSkipSkillPopups': false,
      'suppressTurnProcessingPopups': false,
      'uiAutoZoom': false,
      'uiEnforceAspectRatio': false,
      'uiHorAspectRatio': -1,
      'uiVerAspectRatio': -1,
      'uiHideSidebar': false,
      'uiHideSubmenu': false,
      'uiHideScrollbar': false,
      'uiHideLoadingScreen': false,
      'uiHideMask': false,
      'uiHideFooter': false,
      'uiHideBattleLog': false,
      'uiAlwaysShowAttackBtn': false,
      'uiCompactSupporterList': false,
      'uiDisplayAllProfileSummons': false
    },
    shadowScript = null,
    shadowParent = null,
    shadowRoot = null,
    externalChannel = null,
    pendingExternalMsgs = [],
    isChannelReady = false,
    hasProcessedHome = false,
    hasProcessedArcarumCheckpoint = false,
    arcaWeeklyPoints = 0,
    tweetMessage = '',

    trigger = {},
    scrollbarWidth = 0,
    currZoom = -1,
    canvasZoom = -1;

  //jquery on attrchange mutation observer
  (function ($) {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    $.fn.attrchange = function (callback) {
      if (MutationObserver) {
        var options = {
          subtree: false,
          attributes: true
        };

        var observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (e) {
            callback.call(e.target, e.attributeName);
          });
        });

        return this.each(function () {
          observer.observe(this, options);
        });

      }
    }
  })(jQuery);

  var injectSyncScript = function() {
    if (syncInit) {
      return;
    }
    syncInit = true;
    shadowParent = document.createElement("div");
    document.documentElement.appendChild(shadowParent);
    shadowRoot = shadowParent.attachShadow({ mode: 'closed' });;
    shadowScript = document.createElement("iframe");
    shadowScript.style = "display: none";
    shadowRoot.appendChild(shadowScript);
    $.get(chrome.runtime.getURL('lib/jquery-3.0.0.min.js'), function (result) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.charset = 'utf-8';
      s.textContent = result;
      shadowScript.contentDocument.documentElement.appendChild(s);
    });
    $.get(chrome.runtime.getURL('src/content/inject.js'), function (result) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.charset = 'utf-8';
      s.textContent = result;
      shadowScript.contentDocument.documentElement.appendChild(s);
      externalChannel = new MessageChannel();
      externalChannel.port1.onmessage = handleExternalMessage;
      shadowScript.contentWindow.postMessage({
        'init': 'ancInit',
        'options': options,
        'ostat': chrome.runtime.getURL('src/content/ostat.json')
      }, "*", [externalChannel.port2]);
    });
  };

  var sendExternalMessage = function (msg) {
    if (!externalChannel || !isChannelReady) {
      pendingExternalMsgs.push(msg);
      return;
    }
    externalChannel.port1.postMessage(msg);
  };

  function handleExternalMessage(msg) {
    var message = msg.data;
    var data = message.data;
    var type = message.type;
    switch (type) {
      case 'pageLoad':
      case 'request':
        chrome.runtime.sendMessage({
          'type': type,
          'data': data
        });
        break;
      case 'initExternal':
        isChannelReady = true;
        for (var i = 0, l = pendingExternalMsgs.length; i < l; i++) {
          externalChannel.port1.postMessage(pendingExternalMsgs[i]);
        }
        pendingExternalMsgs = [];
        break;
      case 'consoleLog':
        consoleLog("external", data.msg);
        break;
      default:
        consoleLog("external", "Unhandled message type: " + type);
        break;
    }
  };

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var data = message.data;
    var type = message.type;
    switch (type) {
      case 'pageLoad':
        pageLoad(data);
        break;
      case 'selectQuest':
        $('.prt-list-contents').each(function (index) {
          tempImageURLS[$(this).find('.txt-quest-title').first().text()] = $(this).find('.img-quest').first().attr('src');
        });
        break;
      case 'startQuest':
        if (tempImageURLS[data.name] !== undefined) {
          sendResponse(tempImageURLS[data.name]);
        } else {
          sendResponse(null);
        }
        break;
      case 'checkRaids':
        var list = $('#prt-multi-list');
        var raids = [];
        list.find('.btn-multi-raid').each(function (index) {
          if ($(this).find('.ico-enter').length > 0) {
            raids.push({
              id: '' + $(this).data('raid-id'),
              name: $(this).data('chapter-name'),
              imgURL: $(this).find('.img-raid-thumbnail').first().attr('src'),
              host: ($(this).find('.txt-request-name').text() === 'You started this raid battle.')
            });
          }
        });

        var unclaimed = false;
        if ($('.btn-unclaimed').length > 0) {
          unclaimed = true;
        }

        var type;
        if ($('#tab-multi').hasClass('active')) {
          type = 'normal';
        } else {
          type = 'event';
        }

        chrome.runtime.sendMessage({
          'type': 'checkRaids',
          'data': {
            'raids': raids,
            'unclaimed': unclaimed,
            'type': type
          }
        });
        break;
      case 'syncClient':
        if (options.syncAll || options.syncTurns || options.syncBossHP || options.syncAbilities) {
          if (data.type === "start") {
            gameState.raid_id = data.raid_id;
          }
          if (data.raid_id === gameState.raid_id) {
            if ((options.syncAll || options.syncTurns) && data.turn !== null) {
              gameState.turn = data.turn;
            }
            if ((options.syncAll || options.syncAbilityTurns) && data.ability_turn !== null) {
              gameState.ability_turn = data.ability_turn;
            }
            if (options.syncAll || options.syncBossHP) {
              if (data.boss !== null) {
                for (var i = 0; i < gameState.enemies.length; i++) {
                  if (data.boss[i] !== undefined && data.boss[i] !== null) {
                    gameState.enemies[i] = data.boss[i];
                  } else {
                    gameState.enemies[i] = null;
                  }
                }
              }
            }
            if (options.syncAll || options.syncSummons) {
              if (data.summons !== null) {
                updateSummonCooldowns(data.summons);
                sendExternalMessage({
                  'type': 'updateSummons',
                  'data': {
                    'cooldowns': data.summons.cooldowns,
                    'lyria_pos': data.summons.lyria_pos,
                    'lyria_num': data.summons.lyria_num,
                    'summon_enable': data.summons.summon_enable
                  }
                });
              }
            }
            updateClient(gameState, data.ignoredEnemyHPValues, data.type);
            if (data.characters !== null && data.formation !== null) {
              if (options.syncAll || options.syncAbilities) {
                updateAbilityCooldowns(data.characters, data.formation);
                sendExternalMessage({
                  'type': 'updateAbilities',
                  'data': {
                    'formation': data.formation,
                    'characters': data.characters
                  }
                });
              }
              if (options.syncAll || options.syncPlayerHP) {
                updatePlayerHP(data.characters, data.formation);
                sendExternalMessage({
                  'type': 'updatePlayerHP',
                  'data': {
                    'formation': data.formation,
                    'characters': data.characters
                  }
                });
              }
              if (options.syncAll || options.syncPlayerFormation) {
                if (data.hasFormationChanged) {
                  updatePlayerFormation(data.characters, data.formation);
                  sendExternalMessage({
                    'type': 'updateClientFormationData',
                    'data': {
                      'formation': data.formation,
                      'characters': data.characters
                    }
                  });
                }
              }
              if (options.syncAll || options.syncPotions) {
                if (data.potions !== null) {
                  updatePotions(data.potions);
                  sendExternalMessage({
                    'type': 'updatePotions', 'data': data.potions
                  });
                }
              }
            }
          }
        }
        break;
      case 'setTweetMessage':
        tweetMessage = data;
        break;
      case 'checkOugiToggle':
        if (!$('.btn-lock').hasClass('lock' + data)) {
          sendExternalMessage({
            'type': 'updateOugiToggleBtn', 'data': data
          });
          ougiBugged = true;
        }
        break;
      case 'fastRefresh':
        sendExternalMessage({
          'type': 'fastRefresh', 'data': true
        });
        break;
      case 'setExternalOption':
        options[data.id] = data.value;
        sendExternalMessage({
          'type': 'updateSyncOptions',
          'data': {
            'id': data.id,
            'value': data.value
          }
        });
        updateAll();
        break;
      default:
        console.log("Unhandled message type: " + type);
        break;
    }
  });

  var pageLoad = function(url) {
    if (url.indexOf('#guild') !== -1) {
      if ($('.prt-assault-guildinfo').length > 0) {
        var times = [];
        $('.prt-assault-guildinfo').find('.prt-item-status').each(function(index) {
          var text = $(this).text();
          var hour = parseInt(text.split(':')[0]);
          if (text.indexOf('p.m.') !== -1 && text.indexOf('p.m') < text.length - 5) {
            if (hour !== 12) {
              hour += 12;
            }
          } else if (hour === 12) {
            hour = 0;
          }
          times[index] = hour;
        });
        chrome.runtime.sendMessage({
          'type': 'assault',
          'data': {
            'times': times
          }
        });
      }
    } else if (url.indexOf('#mypage') !== -1) {
      
    } else if (url.indexOf('#coopraid/room/') !== -1) {
      chrome.runtime.sendMessage({
        'type': 'coopCode',
        'data': $('.txt-room-id').eq(0).text()
      });
    } else if (url.indexOf('#casino') !== -1) {
      var amt = parseInt($('.prt-having-medal').children('.txt-value').first().attr('value'));
      if (!isNaN(amt)) {
        chrome.runtime.sendMessage({
          'type': 'chips',
          'data': {
            'amount': amt
          }
        });
      }
    } else if (url.indexOf('#profile') !== -1) {
    } else if (url.indexOf('#quest/index') !== -1) {
      $('.prt-quest-index').first().bind('DOMSubtreeModified',function(){
        if ($('.btn-recommend.visible').length !== 0) {
          $('.prt-quest-detail').each(function() {
            if ($(this).find('.txt-quest-title').text() === 'Angel Halo') {
              var time = $(this).find('.prt-remain-time');
              if (time.length !== 0 && time.text().indexOf('Starts') !== -1) {
                var num = time.first().text();
                if (num.indexOf('hour') !== -1) {
                  chrome.runtime.sendMessage({
                    'type': 'angel',
                    'data': {
                      'delta': parseInt(num.substring(10, num.indexOf(' hour'))) + 1,
                      'active': false
                    }
                  });
                } else if (num.indexOf('minutes') !== -1) {
                  chrome.runtime.sendMessage({
                    'type': 'angel',
                    'data': {
                      'delta': 1,
                      'active': false
                    }
                  });
                }
              } else {
                chrome.runtime.sendMessage({
                  'type': 'angel',
                  'data': {
                    'delta': 1,
                    'active': true
                  }
                });
              }
            }
          });
        }
      });
    } else if (url.indexOf('#quest/assist') !== -1) {
      if ($('.btn-unclaimed').length > 0) {
      }
    }
  };

  var consoleLog = function(sender, message) {
    chrome.runtime.sendMessage({
      'type': 'consoleLog',
      'data': {
        'sender': sender,
        'message': message
      }
    });
  };

  var updateClient = function(gs, ignoredEnemyHPValues) {
    sendExternalMessage({
      'type': 'gameState',
      'data': {
        'turn': gs.turn,
        'ability_turn': gs.ability_turn,
        'enemies': gs.enemies,
        'ignoredEnemyHPValues': ignoredEnemyHPValues
      }
    });
  };

  var updateAbilityCooldowns = function(chars, formation) {
    if (chars === undefined || chars === null || formation === undefined || formation === null) {
      return;
    }
    var pos;
    var abilities;
    var ability;
    var $ability;
    var $abilities;
    var $abilityParent;
    var $abilityShine;
    var $charContainer;

    for (var i = 0; i < formation.length; i++) {
      pos = formation[i];
      if (chars[pos] === undefined || chars[pos] === null) {
        continue;
      }

      abilities = chars[pos].abilities;

      for (var j = 0; j < abilities.length; j++) {

        ability = abilities[j];
        if (ability === undefined || ability === null) {
          continue;
        }

        $ability = $('.ability-character-num-' + (i + 1) + '-' + (j + 1));
        if (!$ability.length) {
          continue;
        }

        for (var k = 0; k < $ability.length; k++) {
          $($ability[k]).attr('ability-recast', ability.cooldown);
          $abilityParent = $($ability[k]).parent();
          $abilityShine = $abilityParent.find('.ico-ability-shine');

          if (ability.cooldown === 0) {
            if ($abilityParent.hasClass('btn-ability-unavailable')) {
              $abilityParent.removeClass('btn-ability-unavailable').addClass('btn-ability-available');
            }
            if ($abilityShine.length) {
              $abilityShine.css('display', 'none');
            }
          } else {
            if ($abilityParent.hasClass('btn-ability-available')) {
              $abilityParent.removeClass('btn-ability-available').addClass('btn-ability-unavailable');
            }
            if ($abilityShine.length) {
              $abilityShine.css('display', 'block');
            }
          }
          $abilityShine.attr('class', 'shine' + ability.cooldown + ' ico-ability-shine');
          $abilityParent.find('.ico-ability-recast').find('span').attr({
            'class': 'num-recast-a' + ability.cooldown + ' ability-icon-num-' + (i + 1) + '-' + (j + 1),
            'value': ability.cooldown
          });

          if (ability.data.start_skill_set_recast !== undefined &&
              ability.data.start_skill_set_recast !== null &&
              ability.data.start_skill_set_recast != 0 &&
              ability.data.start_skill_set_recast !== '') {
            $abilityParent.find('.prt-start-recast').attr('class', 'prt-start-recast start-recast-' + ability.cooldown);
          } else {
            $abilityParent.find('.prt-start-recast').attr('class', 'prt-start-recast');
          }
        }

        $charContainer = $('.lis-character' + i);
        if (!$charContainer.length >= 2) {
          continue;
        }

        // only interate first 2 elements, not sure what the other remaining 2 are for
        // probably for popup prompts??
        for (var k = 0; k < 2; k++) {
          $ability = $($charContainer[k]).find('.ability' + (j + 1));
          if (!$ability.length) {
            continue;
          }

          for (var m = 0; m < $ability.length; m++) {

            if (ability.cooldown === 0) {
              $($ability[m]).attr('state', '2');
            } else {
              $($ability[m]).attr('state', '1');
            }
          }
        }
      }
    }
  };

  var updateSummonCooldowns = function (data) {
    if (data === undefined || data === null) {
      return;
    }
    if (data.summon_enable <= 0) {
      $('.prt-list-top').removeClass('summon-on').addClass('summon-off');
    } else {
      if (data.canSummon) {
        $('.prt-list-top').removeClass('summon-disable summon-off').addClass('summon-on');
      } else {
        $('.prt-list-top').removeClass('summon-on').addClass('summon-disable summon-off');
      }
    }
    $('.lis-summon').each(function (i) {
      if (data.cooldowns[i].turn !== undefined && data.cooldowns[i].turn !== null) {
        if (data.cooldowns[i].turn > 0 || data.summon_enable <= 0 || !data.canSummon) {
          $(this).removeClass('on btn-summon-available').addClass('off btn-summon-unavailable');
          if (data.cooldowns[i].special_once_flag && data.cooldowns[i].turn > 1000) {
            $(this).addClass('non-reusable');
          }
        } else {
          $(this).removeClass('off btn-summon-unavailable').addClass('on btn-summon-available');
        }
      }
      $(this).attr('summon-recast', data.cooldowns[i].turn);
      $($(this).find('.ico-summon-recast').children()[0]).removeClass().addClass('num-recast-s' + data.cooldowns[i].turn);
    });
    if ($('.quick-summon').length > 0) {
      $('.quick-summon').each(function (i) {
        if (data.cooldowns[i].turn !== undefined && data.cooldowns[i].turn !== null) {
        }
        $(this).attr('recast', data.cooldowns[i].turn);
      });
    }
  }

  var updatePlayerHP = function(chars, formation) {
    if (chars === undefined || chars === null || formation === undefined || formation === null) {
      return;
    }
    var pos;
    var $charContainer;
    var $char;
    var $charHPText;
    var $charHPBar;
    var $charChargeBar;
    var hpPercent;

    for (var i = 0; i < formation.length; i++) {
      pos = formation[i];

      if (chars[pos] === undefined || chars[pos] === null) {
        continue;
      }
      if (isNaN(chars[pos].currHP) || isNaN(chars[pos].maxHP) || isNaN(chars[pos].currCharge)) {
        continue;
      }

      $charContainer = $('.lis-character' + i);
      if (!$charContainer.length >= 2) {
        continue;
      }

      // only interate first 2 elements, not sure what the other remaining 2 are for
      // probably for popup prompts??
      for (var j = 0; j < 2; j++) {
        $char = $($charContainer[j]);

        hpPercent = Math.trunc(chars[pos].currHP * 100 / chars[pos].maxHP);
        $charHPText = $char.find('.txt-hp-value');
        $charHPText.text(chars[pos].currHP);
        $charHPBar = $char.find('.prt-gauge-hp-inner');
        $charHPBar.css('width', hpPercent + '%');
        if (hpPercent > 25) {
          $charHPText.attr('color', 'green');
          $charHPBar.attr('color', 'green');
        } else {
          $charHPText.attr('color', 'red');
          $charHPBar.attr('color', 'red');
        }

        $char.find('.txt-gauge-value').text(chars[pos].currCharge);
        $charChargeBar = $char.find('.prt-gauge-special');

        if (chars[pos].currCharge < 100) {
          $charChargeBar.find('.prt-gauge-special-inner').css('width', chars[pos].currCharge + '%');
          $charChargeBar.find('.prt-gauge-special2-inner').css('width', '0%');
          $charChargeBar.find('.prt-shine').css('display', 'none');
          $charChargeBar.find('.prt-shine2').css('display', 'none');
        } else if (chars[pos].currCharge >= 100 && chars[pos].currCharge < 200) {
          $charChargeBar.find('.prt-gauge-special-inner').css('width', '100%');
          $charChargeBar.find('.prt-gauge-special2-inner').css('width', ((chars[pos].currCharge - 100) > 0 ? (chars[pos].currCharge - 100) : 0) + '%');
          $charChargeBar.find('.prt-shine').css('display', 'block');
          $charChargeBar.find('.prt-shine2').css('display', 'none');
        } else {
          $charChargeBar.find('.prt-gauge-special-inner').css('width', '100%');
          $charChargeBar.find('.prt-gauge-special2-inner').css('width', '100%');
          $charChargeBar.find('.prt-shine').css('display', 'block');
          $charChargeBar.find('.prt-shine2').css('display', 'block');
        }
      }
    }
  };

  var updatePlayerFormation = function(chars, formation) {
    if (chars === undefined || chars === null || formation === undefined || formation === null) {
      return;
    }

    var pos;
    var abilities;
    var ability;
    var $ability;
    var $abilities;
    var $abilityParent;
    var $abilityIcon;
    var $charContainer;
    var $charImage;
    var textData;

    var isViramate = false;
    var viramateShortcuts = ['Q', 'W', 'E', 'R'];

    if ($('.quick-panels').length) {
      isViramate = true;
    }

    for (var i = 0; i < formation.length; i++) {
      pos = formation[i];
      if (chars[pos] === undefined || chars[pos] === null) {
        continue;
      }
      if (chars[pos].currHP <= 0) {
        continue;
      }

      $charContainer = $('.lis-character' + i);
      if (!$charContainer.length >= 2) {
        continue;
      }

      for (var j = 0; j < 2; j++) {
        $charImage = $($charContainer[j]).find('.img-chara-command');
        if (chars[pos].currHP <= 0) {
          $charImage.attr('src', '*//game-a1.granbluefantasy.jp/assets_en/img/sp/assets/npc/raid_normal/3999999999.jpg');
          if (isViramate) {
            $('.quick-panels').find("[index='" + i + "']");
          }
        } else {
          $charImage.attr('src', chars[pos].image);
          $($charContainer[j]).find('.ico-type').attr('class', 'ico-type ico-attribute-' + chars[pos].attribute);
        }
      }

      abilities = chars[pos].abilities;

      for (var j = 0; j < abilities.length; j++) {

        ability = abilities[j];
        $ability = $('.ability-character-num-' + (i + 1) + '-' + (j + 1));
        if (!$ability.length) {
          continue;
        }

        for (var k = 0; k < $ability.length; k++) {
          $abilityParent = $($ability[k]).parent();
          if (ability !== undefined && ability !== null) {
            $($ability[k]).attr(ability.data);
            if (ability.data['text-data'].indexOf('</div>') === -1) {
              textData = '<div class=prt-text-small>' + ability.data['text-data'] + '</div>';
            } else {
              textData = ability.data['text-data'];
            }
            $($ability[k]).attr('text-data', textData);

            if (isViramate) {
              $($ability[k]).attr('hotkey-text', viramateShortcuts[j]);
            }

            $abilityIcon = $($ability[k]).find('.img-ability-icon');
            if ($abilityIcon.length) {
              $abilityIcon.attr('src', ability.image).css({ 'height': '44px', 'width': '44px' });
            } else {
              $($ability[k]).append($('<img/>', {
                'class': 'img-ablity-icon',
                'src': ability.image
              }).css({ 'height': '44px', 'width': '44px' }));
            }

            textData = ability.data['ability-name'] + '\n';
            textData += ability.data['text-data'].replace('<div class=prt-text-small>', '').replace('</div>', '') + '\n';
            textData += 'Cooldown: ' + ability.cooldown + ' turn(s)';
            $abilityParent.attr('title', textData);
            $abilityParent.removeClass('empty');
            
            for (var m = 0; m < 2; m++) {
              $ability = $($charContainer[m]).find('.ability' + (j + 1));
              if (!$ability.length) {
                continue;
              }

              for (var n = 0; n < $ability.length; n++) {
                $($ability[n]).attr('type', ability.data['icon-type']);
              }
            }
          } else {
            $abilityParent.removeClass('btn-ability-available').removeClass('btn-ability-unavailable').addClass('empty');

            $ability.find('img').remove();
            $ability.each(function () {
              var attributes = this.attributes;
              for (var k = attributes.length - 1; k > 0; --k) {
                var attr = attributes[k];
                if (attr.name.indexOf('class') === -1) {
                  this.removeAttributeNode(attr);
                }
              }
            });

            var $span = $abilityParent.find('.ico-ability-recast').find('span');
            $span.attr({
              'class': 'num-recast-a0 ability-icon-num-' + (i + 1) + '-' + (j + 1)
            });
            $span.removeAttr('value');

            $abilityParent.find('.ability-character-num-' + (i + 1) + '-' + (j + 1)).attr('class', 'ico-ability ability-character-num-' + (i + 1) + '-' + (j + 1));
            $abilityParent.find('.ico-ability-shine').attr('class', 'ico-ability-shine');
            
            for (var m = 0; m < 2; m++) {
              $ability = $($charContainer[m]).find('.ability' + (j + 1));
              if (!$ability.length) {
                continue;
              }

              for (var n = 0; n < $ability.length; n++) {
                $($ability[n]).attr('state', '0');
              }
            }
          }
        } 
      }
    }
  }

  var updatePotions = function(potions) {
    var $small = $('.item-small');
    var $large = $('.item-large');
    var $elixir = $('.item-potion');
    var $eventContainer = $('.prt-event-item');
    var $eventPotions;
    var $event;

    if ($small.length) {
      $small.find('.having-num').text(potions.small);
      if (potions.small != 0) {
        $small.removeClass('disable');
      } else if ($small.hasClass('disable')) {
        $small.addClass('disable');
      }
    }

    if ($large.length) {
      $large.find('.having-num').text(potions.large);
      if (potions.large != 0) {
        $large.removeClass('disable');
      } else if ($large.hasClass('disable')) {
        $large.addClass('disable');
      }
    }

    if (!potions.elixir.is_trialbattle && potions.elixir.limit_flg) {
      if ($elixir.length) {
        $elixir.find('.having-num').text(potions.elixir.count);
        if (potions.elixir.limit_remain != 0) {
          $elixir.removeClass('disable');
        } else if ($elixir.hasClass('disable')) {
          $elixir.addClass('disable');
        }
      }
    }

    if ($eventContainer.length) {
      $eventPotions = $eventContainer.find('.btn-event-item');
      for (var i = 0; i < $eventPotions.length; i++) {
        for (var j in potions) {
          if (!potions.hasOwnProperty(j)) continue;
          if ($($eventPotions[i]).attr('item-id') === j) {
            $($eventPotions[i]).find('.having-num').text(potions[j]);
          }
        }
      }
    }
  }

  var updateAttackBtn = function () {
    if ($('.btn-attack-start').attr('style') !== undefined) return;
    $(".prt-special-chain").css('z-index', '4');
    $(".btn-attack-start").css('display', 'block');
    $(".btn-attack-start").css('transform', 'translate(-170px, 0px)');
  };

  var updateBattleLog = function () {
    if (!options.uiHideBattleLog) return;
    if ($(".prt-raid-log").css('display') != 'none') {
      $(".prt-raid-log").css('display', 'none');
    }
  };

  var updateFooter = function () {
    if (options.uiHideFooter) {
      if ($(".cnt-global-footer").css('display') != 'none') {
        $(".cnt-global-footer").css('display', 'none');
      }
    } else {
      if ($(".cnt-global-footer").attr('style') !== undefined && $(".cnt-global-footer").attr('style') !== false) {
        $(".cnt-global-footer").removeAttr('style');
      }
    }
  };

  var updateMasks = function () {
    if (!options.uiHideMask) return;
    if ($("#main-mask").css('display') != 'none') {
      $(".active-mask").each(function () {
        $(this).hide();
      });
      //$(".prt-mask").each(function () {
      //  $(this).hide();
      //});
    }

    if ($(".mask").css('display') != 'none') {
      if ($(".mask").css('z-index') != 0) {
        if (/(\/\#raid\/)|(\/\#raid_multi\/)/i.test(window.location.href)) {
          $(".mask").css('z-index', 0);
        }
      }
    } else if ($(".mask").css('display') == 'none') {
      if ($(".mask").css('z-index') == 0) {
        if (!/(\/\#raid\/)|(\/\#raid_multi\/)/i.test(window.location.href)) {
          $(".mask").css('z-index', '');
        }
      }
    }
  };

  var updateLoadingScreen = function () {
    if (!options.uiHideLoadingScreen) return;
    $("#ready").hide();
    $("#loading").hide();
    $(".prt-start-direction").hide();
    //$(".mask").hide();
    $("#opaque-mask").hide();
  };

  var updateSidebar = function () {
    if (options.uiHideSidebar) {
      $(".z5cwqEHi5T8D9u8TPHH6m").each(function () {
        $(this).hide();
      });
      if ($("._3CTtyx1weTpsYWGGPfcPYc").length) {
        $(".SdEyhW_kE0xoDznTZ5Wr-").css('margin-left', '0px');
      }
    } else {
      $(".z5cwqEHi5T8D9u8TPHH6m").each(function () {
        $(this).show();
      });
      if ($("._3CTtyx1weTpsYWGGPfcPYc").length) {
        $(".SdEyhW_kE0xoDznTZ5Wr-").css('margin-left', '64px');
      }
    }
  };

  var updatePopup = function(elem) {
    // hack fix since viramate changes CSS on this
    if ($(elem).css('position') == 'fixed') {
      if (!options.uiHideSidebar && currZoom !== -1) {
        var pix = parseFloat((63 / currZoom).toFixed(1)) + 'px';
        if ($(elem).css('left') != pix) {
          $(elem).attr('style', $(elem).attr('style') + 'left: ' + pix + ' !important;');
        }
      } else {
        if ($(elem).css('left') != '0px') {
          $(elem).attr('style', $(elem).attr('style') + 'left: 0px !important;');
        }
      }
    }
  };

  var updateAT = function () {
    var elem = $(".prt-assault-time");
    if (elem.css('display') == 'block') {
      if (elem.text().indexOf("sec") !== -1) {
        if (elem.css('height') != '35px') {
          elem.css('height', '35px');
        }
        if (elem.css('font-size') != '13px') {
          elem.css('font-size', '13px');
        }
        elem.text(elem.text().replace(" min", "m").replace(" sec", "s"));
      }
    }
  }

  var updateSubmenu = function () {
    if (options.uiHideSubmenu) {
      $("#submenu").hide();
    } else {
      $("#submenu").show();
    }
  };

  var updateScrollbar = function () {
    var elem = $('.SdEyhW_kE0xoDznTZ5Wr-');
    if (options.uiHideScrollbar) {
      if (elem.css('margin-right') !== '-50px') {
        elem.css({ 'margin-right': '-50px', 'padding-right': '50px' });
      }
    } else {
      if (elem.css('margin-right') !== '0px') {
        elem.css({ 'margin-right': '0px', 'padding-right': '0px' });
      }
    }
  };

  var updateScrollbarWidth = function () {
    var scrollDiv = document.createElement("div");
    scrollDiv.style.cssText = "width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;";
    document.body.appendChild(scrollDiv);
    scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  };

  var updateZoom = function () {
    if (!options.uiAutoZoom) return;
    // aspect ratio
    var newZoom = -1;
    if (options.uiEnforceAspectRatio) {
      var maxClamp = Math.min(window.innerHeight / (options.uiVerAspectRatio <= 0 ? 1 : options.uiVerAspectRatio) * (options.uiHorAspectRatio <= 0 ? 1 : options.uiHorAspectRatio), window.innerWidth);
      newZoom = (window.innerWidth <= 0 ? 0 : window.innerWidth >= maxClamp ? maxClamp : window.innerWidth) / 320;
    } else {
      newZoom = window.innerWidth / 320;
    }
    if (!options.uiHideSubmenu) {
      newZoom -= 0.15;
      newZoom /= 2;
    }
    if (!options.uiHideSidebar) {
      newZoom -= 0.2;
      if (!options.uiHideSubmenu) {
        newZoom += 0.1;
      }
    }
    if (!options.uiHideScrollbar) {
      updateScrollbarWidth();
      newZoom -= (scrollbarWidth / 320);
      if (!options.uiHideSubmenu) {
        newZoom += (scrollbarWidth / 640);
      }
    }
    currZoom = newZoom;
    return newZoom;
  };

  var updateSupporter = function () {
    if (!options.uiCompactSupporterList) return;
    var items = $('.prt-supporter-thumb');
    var hasUpdated = true;
    for (var i = 0; i < items.length; i++) {
      if ($(items[i]).css('display') !== 'none') {
        hasUpdated = false;
        break;
      }
    }
    if (hasUpdated) {
      return;
    }
    $('.prt-supporter-list .btn-supporter.lis-supporter').each(function () {
      if (this.dataset.supporterEvolution == 3) {
        $(this).find('.prt-supporter-summon').addClass('bless-rank1-style');
      }
      if (this.dataset.supporterEvolution == 4) {
        $(this).find('.prt-supporter-summon').addClass('bless-rank2-style');
      }
      $(this).prepend($('<div/>', {
        'style': `
          position: absolute;
          background: url('*//game-a.granbluefantasy.jp/assets_en/img/sp/quest/supporter/parts-s6c9ecf5216.png') no-repeat 0 -388px;
          background-size: 320px 1745px;
          height: 12px;
          width: 303px;
          left: 0;
          bottom: -4px;
        `
      }));
    });
    $('.prt-supporter-thumb').hide();
    $('.prt-summon-quality').hide();
    $('span.txt-supporter-level').hide();
    $('.prt-summon-skill').css('visibility', 'hidden');
    $('.prt-summon-max').css('float', 'right');
    $('.prt-summon-image').css('top', '-27px');
    $('.prt-supporter-name').css('margin-left', '40px');
    $('.lis-supporter .prt-supporter-name').css('top', '1px');
    $('.prt-supporter-summon.bless-rank1-style').css({
      'color': '#ffa826',
      'text-shadow': '0px 0px 1px #694429, 0px 0px 1px #694429, 0px 0px 1px #694429, 0px 0px 2px #694429, 0px 0px 2px #694429, 0px 0px 2px #694429'
    });
    $('.prt-supporter-summon.bless-rank2-style').css({
      'color': '#e3b7ff',
      'text-shadow': '0px 0px 1px #7f12b7, 0px 0px 1px #7f12b7, 0px 0px 1px #7f12b7, 0px 0px 2px #7f12b7, 0px 0px 2px #7f12b7, 0px 0px 2px #7f12b7'
    });
    $('.btn-supporter.lis-supporter').css({
      'display': 'block',
      'height': '43px',
      '-webkit-box-sizing': 'border-box',
      'box-sizing': 'border-box',
      'margin': '0 auto 5px',
      'padding': '9px 0px 0px 10px',
      'position': 'relative'
    });
  };

  var updateProfileSupport = function () {
    if (!options.uiDisplayAllProfileSummons) return;
    var items = $('.prt-fix-support-wrap');
    var hasUpdated = true;
    for (var i = 0; i < items.length; i++) {
      if ($(items[i]).hasClass('disableView')) {
        hasUpdated = false;
        break;
      }
    }
    if (hasUpdated) {
      return;
    }
    $('.prt-fix-support-wrap').removeClass('disableView');
    $('#prt-support-summon-list').append($('.prt-fix-support-wrap')[0]);
    for (var i = 0; i <= $('#prt-type').children().length; i++) {
      $('.icon-supporter-type-' + i).attrchange(function (attrName) {
        $('.prt-fix-support-wrap').removeClass('disableView');
      });
    }
    if ($('.prt-user-id').length) {
      $('.prt-fix-summon').append($('<div/>', {
        'text': 'ID: ' + /(\d+)/g.exec($('.prt-user-id').text())[1],
        'style': 'text-align: right; margin-top: 3px;'
      }))
    }
    $('#prt-type').hide();
    $('#prt-current-type').hide();
    $('.prt-fix-support').each(function () {
      var parent = this;
      $(this).children().each(function () {
        switch ($(this).attr('id')) {
          case 'js-fix-summon00':
          case 'js-fix-summon01':
            updateProfileSupportBtn(parent, '7', '-78');
            break;
          case 'js-fix-summon10':
            updateProfileSupportBtn(parent, '1', '-26');
            break;
          case 'js-fix-summon20':
            updateProfileSupportBtn(parent, '2', '-39');
            break;
          case 'js-fix-summon30':
            updateProfileSupportBtn(parent, '3', '-65.5');
            break;
          case 'js-fix-summon40':
            updateProfileSupportBtn(parent, '4', '0');
            break;
          case 'js-fix-summon50':
            updateProfileSupportBtn(parent, '5', '-52');
            break;
          case 'js-fix-summon60':
            updateProfileSupportBtn(parent, '6', '-13');
            break;
          default:
            break;
        }
      });
      $(this).find('.prt-fix-name').css({
        'display': 'inline-block',
        'width': 'calc(100% - 13px)',
        'left': '0'
      });
    });
  }

  var updateProfileSupportBtn = function (elem, attr, offset) {
    var imgCSS = 'background-size: 11px 90px; width: 11px; height: 11px; display: inline-block; right: 0; margin-top: -2px;';
    var imgBackground = 'background: url(*//game-a.granbluefantasy.jp/assets_en/img/sp/ui/icon/type3-s6c70ac9439.png) no-repeat 0 '
    $('<div/>', {
      'class': 'prt-attribute-' + attr,
      'style': imgBackground + offset + 'px; ' + imgCSS
    }).insertAfter($(elem).find('.prt-fix-name'));
  };

  var parseCanvas = function (elem) {
    if ($(elem).data('height') === undefined || $(elem).data('width') === undefined) {
      return;
    }
    if (canvasZoom != $(elem).css("zoom")) {
      var h = parseInt($(elem).data("height"));
      var w = parseInt($(elem).data("width"));
      if (!isNaN(h) && !isNaN(w)) {
        canvasZoom = Number(((h + w) / ((currZoom * h) + (currZoom * w))).toFixed(3));
        var nH = Math.round((currZoom * h));
        var nW = Math.round((currZoom * w));
        if ((Math.abs(parseInt($(elem).css("height").replace(/([a-z]){1,}/, "") - nH)) > 1) ||
          (Math.abs(parseInt($(elem).css("width").replace(/([a-z]){1,}/, "") - nW)) > 1)) {
          updateCanvas(elem, nH, nW, canvasZoom);
        }
      }
    }
  };

  var updateCanvas = function (el, h, w, z) {
    if (!options.uiAutoZoom) return;
    $(el).css({
      "zoom": z,
      "height": h + 'px',
      "width": w + 'px'
    });
  };

  var updateAll = function () {
    updateSidebar();
    updateSubmenu();
    updateScrollbar();
    updateFooter();
    if (options.uiAutoZoom) {
      updateScrollbarWidth();
      $("#mobage-game-container").css("zoom", updateZoom());
    }
  };

  $(document).ready(function () {

    var backgroundPageConnection = chrome.runtime.connect({
      name: 'content'
    });
    backgroundPageConnection.postMessage({
      'type': 'connect',
      'data': true
    });

    chrome.runtime.sendMessage({
      'type': 'getExternalOptions',
      'data': true
    }, function (response) {
      if (response.value !== null) {
        var doInjectScript = false;
        for (var i in response.value) {
          if (!response.value.hasOwnProperty(i)) continue;
          options[i] = response.value[i];
          if (options[i]) {
            doInjectScript = true;
          }
        }
        if (doInjectScript) {
          injectSyncScript();
        }
        updateAll();
      }
    });
    
    new MutationObserver(function (mutations) {
      if (document.location.href.indexOf('#arcarum2') !== -1) {
        if ($('.pop-point-detail').length) {
          var $arcarumInfo = $('.pop-point-detail').find('.txt-point-num');
          var pts = '' + $arcarumInfo.find('.txt-weekly-point').text();
          if (arcaWeeklyPoints !== pts) {
            arcaWeeklyPoints = pts;
            chrome.runtime.sendMessage({
              'type': 'arcarumWeekly',
              'data': {
                'points': arcaWeeklyPoints,
                'max': $arcarumInfo.find('.txt-weekly-max-point').text()
              }
            });
          }
        } else if (!hasProcessedArcarumCheckpoint && $('.pop-check-point').length) {
          var $arcarumInfo = $('.pop-check-point');
          var val = $arcarumInfo.find('.txt-arcarum-point-num').text().replace('+', '');
          if (!isNaN(val)) {
            chrome.runtime.sendMessage({
              'type': 'arcarumCheckpoint',
              'data': {
                'points': val
              }
            });
            hasProcessedArcarumCheckpoint = true;
          }
        }
      }
      if (document.location.href.indexOf('#mypage') !== -1) {
        if (!hasProcessedHome) {
          if ($('.prt-user-info').length) {
            // old defend order garbage
            //if ($('.txt-do-remain-on-button').length !== 0) {
            //  chrome.runtime.sendMessage(({
            //    'type': 'defense',
            //    'data': {
            //      'time': parseInt($('.txt-do-remain-on-button').text()),
            //      'active': false
            //    }
            //  });
            //} else if ($('.do-underway').length !== 0) {
            //  chrome.runtime.sendMessage({
            //    'type': 'defense',
            //    'data': {
            //      'time': -1,
            //      'active': true
            //    }
            //  });
            //} else {
            //  chrome.runtime.sendMessage({
            //    'type': 'defense',
            //    'data': {
            //      'time': -1,
            //      'active': false
            //    }
            //  });
            //}

            var $prtUserInfo = $('.prt-user-info');
            var $prtInfoStatus = $prtUserInfo.children('.prt-info-status');
            var $prtInfoPossessed = $prtUserInfo.children('.prt-info-possessed');
            var $prtMbpStatus = $prtInfoPossessed.eq(1).children('#mbp-status');
            var $prtArcarumStatus = $prtInfoPossessed.eq(1).children('#arcarum-status');
            var profile = {
              'rank': $prtInfoStatus.find('.txt-rank-value').attr('title'),
              'rankPercent': $prtInfoStatus.find('.prt-rank-gauge-inner').attr('style'),
              'job': $prtInfoStatus.find('.txt-joblv-value').attr('title'),
              'jobPercent': $prtInfoStatus.find('.prt-job-gauge-inner').attr('style'),
              'lupi': $prtInfoPossessed.eq(0).find('.prt-lupi').text(),
              'jobPoints': $prtInfoPossessed.eq(0).find('.prt-jp').text(),
              'crystal': $prtInfoPossessed.eq(0).find('.prt-stone').text(),
              'renown': $prtMbpStatus.find('.txt-current-point').eq(0).text(),
              'prestige': $prtMbpStatus.find('.txt-current-point').eq(1).text(),
              'arcarumTicket': $prtArcarumStatus.find('.prt-arcarum-passport-box').text(),
              'arcapoints': $prtArcarumStatus.find('.prt-arcarum-point-box').text()
            };

            var stopProcess = false;

            for (key in profile.profile) {
              if (!profile.hasOwnProperty(key)) continue;
              if (profile[key] === null || profile[key] === undefined || profile[key] === '') {
                stopProcess = true;
              }
            }

            if (!stopProcess) {
              chrome.runtime.sendMessage({ 'type': 'profile', 'data': profile });
              hasProcessedHome = true;
            }
          }
        }
        if ($('.pop-arcarum-point-detail').length) {
          var $arcarumInfo = $('.pop-arcarum-point-detail').find('.txt-point-num').text().split('/');
          if ($arcarumInfo.length === 2) {
            var pts = '' + $arcarumInfo[0];
            if (arcaWeeklyPoints !== pts) {
              arcaWeeklyPoints = pts;
              chrome.runtime.sendMessage({
                'type': 'arcarumWeekly',
                'data': {
                  'points': arcaWeeklyPoints,
                  'max': $arcarumInfo[1]
                }
              });
            }
          }
        }
      }
      //if (trigger.copy === undefined) {
      //  if ($(".txt-room-id").length || $(".prt-battle-id").length) {
      //    trigger.copy = true;
      //  }
      //}
      mutations.forEach(function (mutation) {
        if (options.uiAlwaysShowAttackBtn) {
          if ($(mutation.target).hasClass('btn-attack-start')) {
            updateAttackBtn();
            if ($(mutation.target).hasClass('display-off')) {
              $(mutation.target).removeClass('display-off').addClass('display-on');
            }
            return;
          }
        }
        if ($(mutation.target).hasClass('prt-assault-time')) {
          updateAT();
          return;
        }
        if ($(mutation.target).hasClass('pop-usual') ||
          $(mutation.target).hasClass('pop-help')) {
          updatePopup(mutation.target);
          return;
        }
        if ($(mutation.target).hasClass('active-mask')) {
          updateMasks();
          return;
        }
        if (options.uiAutoZoom) {
          if ($(mutation.target).is('canvas')) {
            parseCanvas(mutation.target);
            return;
          }
        }
        if (options.uiHideLoadingScreen) {
          if ($(mutation.target).attr('id') === 'ready' ||
            $(mutation.target).attr('id') === 'loading' ||
            $(mutation.target).attr('id') === 'opaque-mask' ||
            //$(mutation.target).hasClass('mask') ||
            $(mutation.target).hasClass('prt-start-direction')) {
            if ($(mutation.target).css('display') !== 'none') {
              updateLoadingScreen();
              return;
            }
          }
        }
        if (options.copyJapaneseName) {
          if ($(mutation.target).attr('id') === 'pop') {
            if (document.location.href.indexOf('#profile') === -1) {
              var $tweettextbox = $(mutation.target).find('#frm-post-tweet');
              if ($tweettextbox.length &&
                $tweettextbox.val() !== tweetMessage) {
                $tweettextbox.val(tweetMessage);
                return;
              }
            }
          }
        }
        if ($(mutation.target).attr('id') === 'submenu') {
          updateSubmenu();
          return;
        }
        if (options.uiDisplayAllProfileSummons) {
          if ($(mutation.target).hasClass('prt-fix-support-wrap')) {
            updateProfileSupport();
            return;
          }
        }
        if (options.uiCompactSupporterList) {
          if ($(mutation.target).hasClass('btn-supporter') &&
            $(mutation.target).hasClass('lis-supporter') &&
            ($(mutation.target).parent().parent().hasClass('prt-supporter-list') || $(mutation.target).parent().parent().attr('id') === 'prt-summon-list-lobby')) {
            if ($(mutation.target).find('.prt-supporter-thumb').css('display') !== 'none') {
              updateSupporter();
              return;
            }
          }
        }
        if ($(mutation.target).hasClass('prt-raid-log')) {
          updateBattleLog();
          return;
        }
      });
    }).observe(document, { attributes: true, attributeOldValue: true, characterData: false, subtree: true, childList: true });


    if (options.uiAutoZoom) {
      $('#mobage-game-container').css({ 'zoom': updateZoom(), 'left': '0px' });
    }
    if ($('nav').length) {
      updateSidebar();
    }
    if ($('.cnt-global-footer').length) {
      updateFooter();
    }
    if ($('.SdEyhW_kE0xoDznTZ5Wr-'.length)) {
      updateScrollbar();
    }

    $(window).resize(function () {
      if (options.uiAutoZoom) {
        $('#mobage-game-container').css({ 'zoom': updateZoom(), 'left': '0px' });
        updateCanvas();
      }
    });
  });
})();
