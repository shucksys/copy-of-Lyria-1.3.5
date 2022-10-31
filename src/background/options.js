(function() {
  var options = {
    ougiRefresh:                  false,
    attackRefresh:                false,
    summonRefresh:                false,
    fasterRefresh:                false,
    alwaysSkipSkillPopups:        false,
    suppressTurnProcessingPopups: false,
    autoCopyCodes:                false,
    skip:                         false,
    skipNext:                     false,
    skipCoopResults:              false,
    skipUpgradeResults:           false,
    syncAll:                      false,
    syncTurns:                    false,
    syncAbilityTurns:             false,
    syncBossHP:                   false,
    syncPlayerHP:                 false,
    syncPotions:                  false,
    syncAbilities:                false,
    syncSummons:                  false,
    syncPlayerFormation:          false,
    enableNotifications:          true,
    muteNotifications:            false,
    apNotifications:              true,
    epNotifications:              true,
    dailyResetNotifications:      true,
    strikeTimeNotifications:      true,
    angelHaloNotifications:       true,
    defenseOrderNotifications:    true,
    isMagFest:                    false,
    increasedRenownLimit:         false,
    freeSingleRoll:               false,
    primarchDaily:                false,
    sortRaidsDifficulty:          false,
    copyJapaneseName:             false,
    uiAutoZoom:                   true,
    uiEnforceAspectRatio:         true,
    uiHorAspectRatio:             15,
    uiVerAspectRatio:             28,
    uiHideSidebar:                true,
    uiHideSubmenu:                true,
    uiHideScrollbar:              true,
    uiHideLoadingScreen:          false,
    uiHideMask:                   true,
    uiHideFooter:                 true,
    uiHideBattleLog:              true,
    uiAlwaysShowAttackBtn:        false,
    uiCompactSupporterList:       true,
    uiDisplayAllProfileSummons:   true,
    windowTheme:                  'Anchira Day',
    notificationTheme:            'Monkey',
    '300011' : false,
    '300021' : false,
    '300031' : true,
    '300041' : true,
    '300051' : true,
    '300421' : false,
    '301381' : false,
    '300441' : null,
    '300451' : null,

    '300061' : false,
    '300071' : false,
    '300081' : true,
    '300091' : true,
    '300101' : true,
    '300411' : false,
    '301071' : false,
    '300491' : null,
    '300501' : null,

    '300111' : false,
    '300121' : false,
    '300141' : true,
    '300151' : true,
    '300161' : true,
    '300381' : false,
    '300481' : false,
    '300511' : null,
    '300521' : null,

    '300171' : false,
    '300181' : true,
    '300191' : true,
    '300261' : true,
    '300391' : false,
    '301371' : false,
    '300531' : null,
    '300541' : null,

    '300201' : false,
    '300211' : true,
    '300221' : true,
    '300271' : true,
    '300431' : false,
    '300461' : false,
    '300561' : null,
    '300571' : null,

    '300231' : false,
    '300241' : true,
    '300251' : true,
    '300281' : true,
    '300401' : false,
    '300551' : false,
    '300581' : null,
    '300591' : null,

    '300291' : false,
    '301051' : false,
    '300471' : null,
    '301061' : null,

    '20411' : false,
    '20421' : false,
    '20431' : false,
    '20441' : false,
    '20451' : false,
    '20461' : false,
    '20471' : false,
    '20481' : false,
    '20491' : false,
    '20501' : false,
    '20511' : false,
    '20671' : false,
    '20681' : false,
    '20691' : false,
    '20701' : false,
    '20751' : false,
    '20761' : false
  };

  var hlRaids = [
    '300441', '300451',
    '300491', '300501',
    '300511', '300521',
    '300531', '300541',
    '300561', '300571',
    '300581', '300591',
    '300471', '301061'
  ];

  var externalOptions = [
    'copyJapaneseName',
    'syncAll',
    'syncTurns',
    'syncAbilityTurns',
    'syncBossHP',
    'syncPlayerHP',
    'syncPotions',
    'syncAbilities',
    'syncSummons',
    'syncPlayerFormation',
    'fasterRefresh',
    'alwaysSkipSkillPopups',
    'suppressTurnProcessingPopups',
    'uiAutoZoom',
    'uiEnforceAspectRatio',
    'uiHorAspectRatio',
    'uiVerAspectRatio',
    'uiHideSidebar',
    'uiHideSubmenu',
    'uiHideScrollbar',
    'uiHideLoadingScreen',
    'uiHideMask',
    'uiHideFooter',
    'uiHideBattleLog',
    'uiAlwaysShowAttackBtn',
    'uiCompactSupporterList',
    'uiDisplayAllProfileSummons'
  ];

  var isHL = false;
  var responseList = {};

  window.Options = {
    Initialize: function(callback) {
      Storage.Get(['options'], function(response) {
        if (response.options !== undefined) {
          if (response.options['primarchDaily'] == undefined) {
            for (var key in options) {
              if (response.options[key] == undefined) {
                response.options[key] = options[key];
              }
            }
            options = response.options;
            Storage.Set('options', options);
          }
          else {
            options = response.options;
            if (options.windowTheme === 'Narumaya' || options.windowTheme === 'Vira') {
              options.windowTheme = 'Tiamat Night';
              Storage.Set('options', options);
            }
          }
        } else {
          Storage.Set('options', options);
        }
        Profile.Get('level', function(value) {
          if (!isHL && value >= 101) {
            isHL = true;
            for (var i = 0; i < hlRaids.length; i++) {
              if (options[hlRaids[i]] === null) {
                setOption(hlRaids[i], false);
              }
            }
          }
        });
        if (callback !== undefined) {
          callback();
        }
      });
    },
    Get: function(id, response) {
      if (response !== undefined) {
        if (responseList[id] === undefined) {
          responseList[id] = [];
        }
        responseList[id].push(response);
      }
      if (options[id] === undefined) {
        options[id] = false;
      }
      return options[id];
    },
    GetExternal: function () {
      var optionsMsg = {};
      for (var i = 0; i < externalOptions.length; i++) {
        if (options[externalOptions[i]] !== undefined) {
          optionsMsg[externalOptions[i]] = options[externalOptions[i]];
        }
      }
      return optionsMsg;
    },
    Set: function (id, value) {
      setOption(id, value);
    }
  };

  var setOption = function(id, value) {
    if (options[id] !== value) {
      options[id] = value;
      Storage.Set('options', options);
      if (responseList[id] !== undefined) {
        for (var i = 0; i < responseList[id].length; i++) {
          responseList[id][i](id, value);
        }
      }
      if (id.length) {
        for (var i = 0; i < id.length; i++) {
          if (id[i] === 'autoRepeat') {
            Message.PostAll({
              'type': 'setOption',
              'data': {
                'id': id[i],
                'value': value
              }
            });
          }
          if (externalOptions.indexOf(id[i]) !== -1) {
            var extID = id[i];
            chrome.tabs.query({}, function (tabs) {
              for (var j = 0; j < tabs.length; j++) {
                if (tabs[j].url.indexOf('http://gbf.game.mbga.jp/') !== -1 ||
                  tabs[j].url.indexOf('http://game.granbluefantasy.jp/') !== -1) {
                  chrome.tabs.sendMessage(tabs[j].id, {
                    'type': 'setExternalOption',
                    'data': {
                      'id': extID,
                      'value': value
                    }
                  });
                }
              }
            });
          }
        }
      }
    }
  };
})();
