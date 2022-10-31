(function() {
  var currTabID  = -1;
  var currURL    = '';
  var pageLoaded = true;
  var corePanelID = null;

  var CURRENT_VERSION = '1.3.0';
  var BASE_VERSION    = '1.0.1';
  var patchNotes = {
    '1.0.1': {
      'index': 0,
      'notes': ['-Vira and Narumaya themes added',
        '-Supply name + location tooltips added',
        '(thanks lolPseudoSmart for supply locations)',
        '-Primarch misc daily added',
        '-Primarch raid + xeno jp names added']
    },
    '1.1.0': {
      'index': 1,
      'notes': ['-Weapon Series planner added',
        'Try it out in the supply tab!',
        '-Vira and Narumaya themes removed']
    },
    '1.1.1': {
      'index': 2,
      'notes': ['-Primarch daily changed to option',
        '-Small UI tweaks']
    },
    '1.1.2': {
      'index': 3,
      'notes': ['-GW 5* planner added',
        '(sorry it\'s so late D:)',
        '(also sorry no weapon drop tracking orz)',
        '-Tooltips added to repeat last quest',
        'and copy to clipboard buttons']
    },
    '1.1.3': {
      'index': 4,
      'notes': ['-Added arcarum ticketes to profile tracker',
        '-Fixed profile tracker',
        '-Skip upgrade/uncap results feature added',
        '-Skip coop results feature added']
    },
    '1.1.4': {
      'index': 5,
      'notes': ['-Sync turn counter between windows feature added',
        '(experimental and probably bug prone)']
    },
    '1.1.5': {
      'index': 6,
      'notes': ['-Improved turn sync between windows',
        '-Also syncs enemy/boss HP between',
        'windows as requested']
    },
    '1.2.0': {
      'index': 7,
      'notes': ['-Bunch of bug fixes',
        '-Separated multiwindow sync options',
        '-Fixed some multiwindow sync issues on refresh',
        '-Sped up refresh by using back/forward',
        'instead of refresh',
        '-Added a refresh option for all attacks',
        '-Fixed autoend quest to work with multiple',
        'self-hosted quests',
        '-Added a nightmare/special quest notification']
    },
    '1.2.1': {
      'index': 8,
      'notes': ['-Minor bug fixes',
        '-Fixed character uncap not skipping correctly',
        '-Fixed ougi toggle button not visually updating',
        'sometimes after refresh',
        '-Faster refresh is now its on toggleable option']
    },
    '1.2.2': {
      'index': 9,
      'notes': ['-Fixed issue with turn counter not resetting',
        'correctly in new raids and quest stages',
        '-Fixed item acquisition from quests',
        '-Removed items that no longer exist in the game',
        '-Updated HL pendant cap and added',
        'crew pendant tracker',
        '-Updated raid list to include the latest raids',
        '-Added Arcarum weekly tracker',
        '-Faster refresh is now its on toggleable option',
        '-Arcarum drops/shop now updates info']
    },
    '1.2.3': {
      'index': 10,
      'notes': ['-Added skill cooldown sync option',
        '!! NOTE FOR VIRAMATE USERS !!',
        'You MUST turn on the option',
        '\'Synchronize status between raid windows\'',
        'under Combat settings or this will NOT work']
    },
    '1.2.4': {
      'index': 11,
      'notes': ['-Other windows should now resync on refresh']
    },
    '1.2.5': {
      'index': 12,
      'notes': ['-Added sync player HP/charge option',
        '-Added sync potions option',
        '-Added sync character swapping option',
        '!! NOTE FOR VIRAMATE USERS !!',
        'This option doesn\'t work as intended with viramate,',
        'more specifically the skills and CDs don\'t swap',
        '-Fixed an issue with sync boss HP not being turned on',
        'which broke a few things',
        '-Fixed an issue where sometimes refresh/sync',
        'didn\'t work with some specific scenarios',
        '-Adjusted some timings on faster refresh',
        '-Other minor fixes']
    },
    '1.2.6': {
      'index': 13,
      'notes': ['-Added an auto repeat option',
        'Clicking the repeat button will toggle',
        'auto repeat while this option is enabled',
        '-Added an auto repeat option']
    },
    '1.2.7': {
      'index': 14,
      'notes': ['-Added an option to always hide skill prompts',
        '-Fixed skill cooldowns sometimes becoming',
        'desynced with viramate',
        '-Fixed an issue with skill buttons',
        'sometimes becoming unresponsive after',
        'being spam clicked and/or triggering',
        'the lockout prompt',
        '-Improved performance with sync',
        '(hopefully less laggy)']
    },
    '1.2.8': {
      'index': 15,
      'notes': ['-Added an option for "skill turn" syncing',
        '-Added an option for auto refreshing summons']
    },
    '1.2.9': {
      'index': 16,
      'notes': ['-Fixed an issue with skill turn sync',
        'not resetting when you join raids']
    },
    '1.2.10': {
      'index': 17,
      'notes': ['-Added summon cooldown syncing']
    },
    '1.2.11': {
      'index': 18,
      'notes': ['-Fixed cooldowns not syncing properly',
        'without Lyria in party']
    },
    '1.2.12': {
      'index': 19,
      'notes': ['-Fixed skill turn counters',
        '(cygames changed some variable references)']
    },
    '1.3.0': {
      'index': 20,
      'notes': ['-Now functions without DevTools open',
        '-Sync settings no longer require a refresh to update',
        '-Major overhaul in code (not that you care)']
    }
  };
  var patchNoteList = [
    '1.0.1',
    '1.1.0',
    '1.1.1',
    '1.1.2',
    '1.1.3',
    '1.1.4',
    '1.1.5',
    '1.2.0',
    '1.2.1',
    '1.2.2',
    '1.2.3',
    '1.2.4',
    '1.2.5',
    '1.2.6',
    '1.2.7',
    '1.2.8',
    '1.2.9',
    '1.2.10',
    '1.2.11',
    '1.2.12',
    '1.3.0'
  ];
  var currentVersion = undefined;
  var connections = {};
  var connectionsContent = {};

  var initializePage = function (id, port, isDev) {
    connections[id] = {};
    connections[id].port = port;
    connections[id].isDev = isDev;
    chrome.tabs.get(id, function (tab) {
      if (isDev) {
        var baseURL = '';
        if (tab.url.indexOf('https://*/*') !== -1) {
          baseURL = 'https://*/*  ';
        } else if (tab.url.indexOf('https://*/* ') !== -1) {
          baseURL = 'https://*/*  ';
        }
        if (baseURL === '') {
          return;
        }
        connections[id].port.postMessage({ 'type': 'setBaseURL', 'data': baseURL });
      }
      var response = [];
      response[0] = {
        'type': 'setTheme',
        'data': Options.Get('windowTheme')
      };
      APBP.GetAP();
      response = response.concat(Profile.InitializeDev());
      response = response.concat(Time.InitializeDev());
      response = response.concat(Dailies.InitializeDev());
      response = response.concat(Casino.InitializeDev());
      response = response.concat(Supplies.InitializeDev());
      response = response.concat(Buffs.InitializeDev());
      response = response.concat(Quest.InitializeDev());
      if (!isDev && corePanelID !== null) {
        var connectionIDs = [];
        for (var i in connections) {
          if (connections.hasOwnProperty(i) && connections[i].isDev) {
            connectionIDs.push(i);
          } 
        }
        response.push({ 'type': 'updateConnections', 'data': connectionIDs });
      }
      connections[id].port.postMessage({ 'type': 'initialize', 'data': response });
    });
  }

  chrome.browserAction.onClicked.addListener(function() {
    chrome.runtime.openOptionsPage();
    //chrome.windows.create({ 'url': chrome.runtime.getURL('src/pages/panel/panel.html'), 'type': 'popup' });
  });

  Storage.GetMultiple(['version'], function(response) {
    currentVersion = response['version'];
    if (!currentVersion) {
      currentVersion = CURRENT_VERSION;
      Storage.Set('version', CURRENT_VERSION);
    }
  });

  var generateNote = function(id) {
    if (patchNotes[id]) {
      var note = 'Version ' +id + ':\n';
      for (var i = 0; i < patchNotes[id].notes.length; i++) {
        note += patchNotes[id].notes[i] + '\n';
      }
      return note;
    }
  };

  Options.Initialize(function() {
    Dailies.Initialize(function() {
      Quest.Initialize(function() {
        Casino.Initialize(function() {
          Time.Initialize(function() {
            Supplies.Initialize();
            Profile.Initialize();
            Buffs.Initialize();
            //Info.Initialize();
          });
        });
      });
    });
  });

  // Content script listener
  var responseList = {};
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var type = message.type;
    var data = message.data;
    switch (type) {
      case 'pageLoad':
        chrome.tabs.sendMessage(sender.tab.id, { 'type': 'pageLoad', 'data': sender.tab.url });
        if (connections[sender.tab.id] !== undefined) {
          connections[sender.tab.id].port.postMessage({ 'type': 'pageLoad', 'data': sender.tab.url });
        }
        var index = sender.tab.url.indexOf('#quest/supporter/');
        var url = '';
        if (index !== -1) {
          url = sender.tab.url.slice(index);
        } else {
          index = sender.tab.url.indexOf('#event/');
          if (index !== -1 && sender.tab.url.indexOf('/supporter/') !== -1) {
            url = sender.tab.url.slice(index);
          }
        }
        if (url !== '') {
          Message.Post(sender.tab.id, {
            'type': 'setClick',
            'data': {
              'id': '#quest-repeat',
              'value': url
            }
          });
          if (corePanelID !== null) {
            Message.Post(corePanelID, {
              'type': 'setRepeat',
              'data': {
                'id': sender.tab.id,
                'value': url
              }
            });
          }
        }
        break;
      case 'setOption':
        Options.Set(data.id, data.value);
        break;
      case 'getOption':
        var id = data;
        sendResponse({
          'id': id,
          'value': Options.Get(id)
        });
        break;
      case 'getExternalOptions':
        sendResponse({
          'value': Options.GetExternal()
        });
        break;
      case 'consoleLog':
        console.log(data.sender + ': ' + data.message);
        break;
      case 'assault':
        Time.SetAssaultTime(data.times);
        break;
      case 'angel':
        Time.SetAngelHalo(data.delta, data.active);
        break;
      case 'defense':
        Time.SetDefenseOrder(data.time, data.active);
        break;
      case 'checkRaids':
        Quest.CheckJoinedRaids(data.raids, data.unclaimed, data.type);
        break;
      case 'chips':
        Profile.SetChips(data.amount);
        break;
      case 'profile':
        Profile.SetHomeProfile(
          data.rank,
          data.rankPercent,
          data.job,
          data.jobPercent,
          data.lupi,
          data.jobPoints,
          data.crystal,
          data.renown,
          data.prestige,
          data.arcarumTicket,
          data.arcapoints
        );
        break;
      case 'arcarumWeekly':
        Dailies.CheckArcarum(data);
        break;
      case 'arcarumCheckpoint':
        Dailies.ArcarumCheckpoint(data);
        Profile.AddArcapoints(data);
        break;
      case 'event':
        //Quest.SetEvent(data);
        break;
      case 'coopCode':
        Quest.SetCoopCode(data, sender.tab.id);
        break;
      case 'request':
        var url = data.url;
        //verify current ap/ep
        if (url.indexOf('/user/status?') !== -1 ||
          url.indexOf('/user/data_assets?') !== -1 ||
          //url.indexOf('/user/content/index?') !== -1 ||
          url.indexOf('/quest/content/') !== -1 ||
          url.indexOf('/coopraid/content/') !== -1 ||
          url.indexOf('/user/content/') !== -1) {
          APBP.VerifyAPBP(data.response);
          Profile.SetLupiCrystal(data.response);
        }
        //check entering raid resources
        if (url.indexOf('/quest/treasure_raid') !== -1) {
          Supplies.RaidTreasureInfo(data.response);
        }
        //check limited quest
        if (url.indexOf('/quest/check_quest_start/') !== -1) {
          Quest.CheckDailyRaid(data.response, url);
        }
        if (url.indexOf('/quest/content/newindex/') !== -1) {
          Quest.UpdateInProgress(data.response, sender.tab.id);
        }
        //initialize quest -> SELECTING QUEST
        if (url.indexOf('/quest/quest_data/') !== -1) {
          APBP.InitializeQuest(data.response);
        }
        //start quest -> ACTUALLY ENTER THE QUEST
        if (url.indexOf('/quest/create_quest?') !== -1) {
          Quest.CreateQuest(data.response, data.payload, sender.tab.id);
          APBP.StartQuest(data.response, data.payload);
          Dailies.DecPrimarchs(data.payload);
        }
        if (url.indexOf('/quest/raid_info?') !== -1) {
          //Quest.CheckMulti(data.payload);
          //payload and response does not have a raid_id
        }

        //quest loot
        // if(url.indexOf('/result/content/') !== -1) {
        //   Supplies.GetLoot(data.response.option.result_data);
        //   Profile.CompleteQuest(data.response.option.result_data);
        // }
        if (url.indexOf('/result/data/') !== -1) {
          Supplies.GetLoot(data.response);
          Profile.CompleteQuest(data.response);
          Quest.CompleteQuest(data.response, url, sender.tab.id);
          Quest.CheckSpecialQuest(data.response);
          Dailies.CompleteQuest(data.response);
        }
        // //initialize raid -> SELECTING RAID
        // if(url.indexOf('/quest/assist_list') !== -1) {
        //     APBP.InitializeRaid(data.response);
        // }
        // //initialize raid through code
        // if(url.indexOf('/quest/battle_key_check') !== -1) {
        //     APBP.InitializeRaidCode(data.response);
        // }
        //join raid
        if (url.indexOf('/quest/raid_deck_data_create') !== -1) {
          APBP.StartRaid(data.payload);
          Quest.CreateRaid(data.payload, sender.tab.id);
        }
        //if(url.indexOf('/check_reward/') !== -1) {
        //  Quest.CompleteQuest(url);
        //}
        //raid loot
        // if(url.indexOf('/resultmulti/content/') !== -1) {
        //     Supplies.GetLoot(data.response.option.result_data);
        //     Profile.CompleteRaid(data.response.option.result_data);
        //     Dailies.CompleteCoop(data.response.option.result_data);
        //     Dailies.CompleteRaid(data.response.option.result_data);
        // }
        if (url.indexOf('/resultmulti/data/') !== -1) {
          Supplies.GetLoot(data.response);
          Profile.CompleteRaid(data.response);
          Quest.CompleteQuest(data.response, url, sender.tab.id);
          Quest.CheckSpecialQuest(data.response);
          Dailies.CompleteCoop(data.response, sender.tab.id);
          Dailies.CompleteRaid(data.response);
        }
        if (url.indexOf('retire.json') !== -1) {
          Quest.AbandonQuest(data.payload);
        }

        //restore ap/bp
        if (url.indexOf('/quest/user_item') !== -1) {
          APBP.RestoreAPBP(data.response);
          Supplies.UseRecovery(data.response, data.payload);
        }
        //gacha
        if (url.indexOf('/gacha/list?_=') !== -1) {
          Dailies.SetDraws(data.response);
        }
        if (url.indexOf('/gacha/normal/result//normal/6?_=') !== -1) {
          Dailies.DecDraws(data.response);
          Profile.LupiDraw(data.response);
        }
        if (url.indexOf('/gacha/result//legend') !== -1) {
          Dailies.DecDraws(data.response);
          //Profile.CrystalDraw(data.response);
        }
        //co-op dailies
        if (url.indexOf('/coopraid/daily_mission?_=') !== -1) {
          Dailies.SetCoop(data.response);
        }
        //casino list
        if (url.indexOf('/casino/article_list/1/1?_=') !== -1 || url.indexOf('/casino/article_list/undefined/1?_=') !== -1) {
          Casino.SetCasino1(data.response);
          Profile.SetChips(data.response.medal.number);
        }
        if (url.indexOf('/casino/article_list/undefined/2?_=') !== -1) {
          Casino.SetCasino2(data.response);
          Profile.SetChips(data.response.medal.number);
        }
        //casino buy
        if (url.indexOf('/casino/exchange?_=') !== -1) {
          Casino.BuyCasino(data.response, data.payload);
          Supplies.BuyCasino(data.response, data.payload);
        }
        if (url.indexOf('/twitter/twitter_info/') !== -1) {
          Dailies.CheckTweet(data.response);
        }
        if (url.indexOf('/twitter/tweet?_=') !== -1) {
          Dailies.UseTweet(data.response);
        }
        if (url.indexOf('/item/recovery_and_evolution_list_by_filter_mode') !== -1) {
          Supplies.SetRecoveryAndPowerUp(data.response);
        }
        if (url.indexOf('/item/article_list_by_filter_mode') !== -1) {
          Supplies.SetTreasure(data.response);
        }
        if (url.indexOf('/item/gacha_ticket_and_others_list_by_filter_mode') !== -1) {
          Supplies.SetDraw(data.response);
        }
        if (url.indexOf('/present/possessed') !== -1) {
          Profile.CheckWeaponSummon(data.response);
        }
        if (url.indexOf('/present/receive') !== -1) {
          Supplies.ReceiveGift(data.response);
          Profile.ReceiveGift(data.response);
        }
        if (url.indexOf('/present/term_receive_all_confirm/') !== -1) {
          Supplies.GetAllGifts(data.response, sender.tab.id);
          Profile.GetAllGifts(data.response, sender.tab.id);
        }
        if (url.indexOf('/present/receive_all?') !== -1 || url.indexOf('/present/term_receive_all?') !== -1) {
          Supplies.ReceiveAllGifts(data.response, sender.tab.id);
          Profile.ReceiveAllGifts(data.response, sender.tab.id);
        }
        //treasure trade purchase
        if (url.indexOf('/shop_exchange/purchase/') !== -1 || url.indexOf('/arcarum/purchase?') !== -1) {
          Supplies.PurchaseItem(data.response);
          Profile.PurchaseItem(data.response);
          Dailies.PurchaseDistinction(data.response);
        }
        if (url.indexOf('/weapon/list/') !== -1) {
          Profile.SetWeaponNumber(data.response, url, sender.tab.id);
        }
        if (url.indexOf('/npc/list/') !== -1) {
          Profile.SetCharacterNumber(data.response, url);
        }
        if (url.indexOf('/summon/list/') !== -1) {
          Profile.SetSummonNumber(data.response, url, sender.tab.id);
        }
        //reduce weapon/summons
        if (url.indexOf('/weapon/decompose?') !== -1 || url.indexOf('/summon/decompose?') !== -1) {
          Profile.Reduce(data.response, sender.tab.id);
        }
        if (url.indexOf('/container/move?') !== -1) {
          Profile.MoveFromStash(data.response);
        }
        if (url.indexOf('/listall/move?') !== -1) {
          Profile.MoveToStash(data.response);
        }
        if (url.indexOf('/shop/point_list') !== -1) {
          Profile.SetDrops(data.response);
        }
        //Moon shop
        if (url.indexOf('/shop_exchange/article_list/5/1/1/null/null/null?') !== -1 || url.indexOf('/shop_exchange/article_list/5/1/1/null/null/3?') !== -1) {
          Dailies.CheckMoons(data.response);
        }
        //do shop
        if (url.indexOf('/shop_exchange/article_list/10/1/1/null/null/') !== -1) {
          Profile.SetDefense(data.response);
          //Dailies.CheckDefense(data.response, url);
        }
        //prestige
        if (url.indexOf('/shop_exchange/article_list/6/1/') !== -1) {
          Dailies.SetDistinctions(data.response);
          //Dailies.CheckDefense(data.response, url);
        }
        if (url.indexOf('/shop/purchase') !== -1) {
          Profile.SpendCrystals(data.response);
        }
        if (url.indexOf('/mbp/mbp_info') !== -1 || url.indexOf('/profile/content/index') !== -1) {
          Dailies.CheckRenown(data.response);
        }
        if (url.indexOf('evolution_weapon/evolution?') !== -1 || url.indexOf('evolution_summon/evolution?') !== -1) {
          Profile.Uncap(data.response, sender.tab.url, sender.tab.id);
          Profile.BuyUncap();
        }
        if (url.indexOf('evolution_weapon/item_evolution?') !== -1 || url.indexOf('evolution_summon/item_evolution?') !== -1) {
          Supplies.Uncap(data.response, sender.tab.url, sender.tab.id);
          Profile.BuyUncap();
        }
        if (url.indexOf('item/evolution_items/') !== -1) {
          Supplies.CheckUncapItem(data.response);
        }
        if (url.indexOf('item/evolution_item_one') !== -1) {
          Supplies.SetUncapItem(data.response);
          Profile.SetUncapItem(data.response);
        }
        if (url.indexOf('weapon/weapon_base_material?') !== -1 || url.indexOf('summon/summon_base_material?') !== -1) {
          Supplies.SetUncap(data.response);
          Profile.SetUncap(data.response, url);
        }
        if (url.indexOf('npc/evolution_materials') !== -1) {
          Supplies.SetNpcUncap(data.response);
        }
        if (url.indexOf('evolution_npc/item_evolution?') !== -1) {
          Supplies.NpcUncap(data.response, sender.tab.id);
          Profile.BuyUncap();
        }
        if (url.indexOf('weapon/weapon_material') !== -1 ||
          url.indexOf('summon/summon_material') !== -1 ||
          url.indexOf('npc/npc_material') !== -1) {
          Profile.SetUpgrade(data.response, url);
        }
        if (url.indexOf('enhancement_weapon/item_enhancement?') !== -1 ||
          url.indexOf('enhancement_summon/item_enhancement?') !== -1 ||
          url.indexOf('enhancement_npc/item_enhancement?') !== -1) {
          Supplies.Upgrade(data.payload, data.response, sender.tab.url, sender.tab.id);
        }
        if (url.indexOf('enhancement_weapon/enhancement') !== -1 ||
          url.indexOf('enhancement_summon/enhancement') !== -1 ||
          url.indexOf('enhancement_npc/enhancement') !== -1) {
          Profile.Upgrade(data.response, sender.tab.url, sender.tab.id);
        }

        if (url.indexOf('/shop_exchange/activate_personal_support?_=') !== -1) {
          Buffs.StartBuff(data.response, data.payload);
        }
        if (url.indexOf('/sell_article/execute') !== -1) {
          Supplies.SellCoop(data.response, data.payload);
        }
        if (url.indexOf('/raid/start.json?_=') !== -1 || url.indexOf('/multiraid/start.json?_=') !== -1) {
          Quest.StartBattle(data.response, sender.tab.id);
          Quest.CopyRaidCode(data.response);
          Quest.CopyTweet(data.response, sender.tab.id);
        }
        if (url.indexOf('/coopraid/content/room/') !== -1 || url.indexOf('/lobby/content/room/') !== -1) {
          Quest.CopyCoopCode(data.response);
        }
        if (url.indexOf('/normal_attack_result.json?_=') !== -1 ||
          url.indexOf('/ability_result.json?_=') !== -1 ||
          url.indexOf('/summon_result.json?_=') !== -1 ||
          url.indexOf('/user_recovery.json?_=') !== -1 ||
          url.indexOf('/chat_result.json?_=') !== -1 ||
          url.indexOf('/temporary_item_result.json?_=') !== -1) {
          Quest.BattleAction(data.response, data.payload, sender.tab.id);
        }
        if (url.indexOf('/rest/raid/setting?') !== -1) {
          Quest.CheckOugiToggle(data.payload, sender.tab.id);
        }
        if (url.indexOf('/quest/init_list') !== -1) {
          //Quest.SetCurrentQuest(data.response);
        }
        if (url.indexOf('/quest/assist_list') !== -1) {
          Quest.CheckJoinedRaids(data.response);
        }
        if (url.indexOf('/gacha/list?') !== -1) {
          Dailies.CheckGacha(data.response);
        }
        if (url.indexOf('/gacha/legend/campaign') !== -1) {
          Dailies.RollCampaign(data.response, data.payload);
        }
        if (url.indexOf('/quest/content/newextra') !== -1) {
          Dailies.SetPrimarchs(data.response);
        }
        if (url.indexOf('/party/job') !== -1) {
          Profile.SetZenith(data.response);
        }
        //arcarum
        if (url.indexOf('/rest/arcarum/start_stage?') !== -1) {
          Profile.ProcessArcarumStage(data.response);
        }
        if (url.indexOf('/rest/arcarum/stage?') !== -1) {
          Profile.ProcessArcarumStage(data.response);
          Supplies.GetLoot(data.response);
        }
        if (url.indexOf('/rest/arcarum/open_chest?') !== -1) {
          Supplies.GetArcarumChest(data.response);
        }
        break;
      default:
        console.log("Unhandled message type: " + type);
        break;
    }
  });

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('gbf.game.mbga.jp') !== -1) {
      if (currURL !== tab.url) {
        pageLoaded = false;
        currURL = tab.url;
      }
      if (currURL === tab.url && pageLoaded) {
        chrome.tabs.sendMessage(tabId, { 'type': 'pageUpdate', 'data': tab.url });
      }
    }
  });

  chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener = function (message, sender) {

      var type = message.type;
      var data = message.data;

      switch (type) {
        case 'connect':
          if (port.name === 'panel') {
            initializePage(port.sender.tab.id, port, false);
            corePanelID = port.sender.tab.id;
          } else if (port.name === 'devtools') {
            initializePage(data, port, true);
          } else if (port.name === 'content') {
            connectionsContent[port.sender.tab.id] = {};
            connectionsContent[port.sender.tab.id].port = port;
            if (corePanelID !== null) {
              var connectionIDs = [];
              for (var i in connectionsContent) {
                if (connectionsContent.hasOwnProperty(i)) {
                  connectionIDs.push(i);
                }
              }
              Message.Post(corePanelID, { 'type': 'updateConnections', 'data': connectionIDs });
            }
          }
          break;
        case 'initialize':
          if (port.name === 'panel') {
            initializePage(message.id, port, false);
          } else if (port.name === 'devtools') {
            initializePage(message.id, port, true);
          }
          break;
        case 'openURL':
          if (port.name === 'panel') {
            chrome.tabs.update(data.id, { 'url': data.url });
          } else {
            chrome.tabs.update(message.id, { 'url': data });
          }
          break;
        case 'getURL':
          chrome.tabs.get(message.id, function (tab) {
            if (tab.url) {
              if (data === 'bookmark' && tab.url.indexOf('http://game.granbluefantasy.jp/') !== -1) {
                var url = tab.url.replace('http://game.granbluefantasy.jp/', '');
                Message.PostAll({ 'type': 'bookmarkURL', 'data': url });
              }
            }
          });
          break;
        case 'getPlanner':
          Supplies.GetPlanner(message.id, data);
          break;
        case 'refresh':
          chrome.tabs.reload(message.id);
          break;
        case 'devAwake':
          if (currentVersion !== CURRENT_VERSION) {
            var note = '';
            if (patchNotes[currentVersion] === undefined) {
              currentVersion = BASE_VERSION;
              note += generateNote(currentVersion);
            }
            var index = patchNotes[currentVersion].index + 1;
            for (var i = index; i < patchNoteList.length; i++) {
              currentVersion = patchNoteList[i];
              note += generateNote(currentVersion);
            }
            Message.Post(message.id, { 'type': 'setMessage', 'data': note });
            currentVersion = CURRENT_VERSION;
            Storage.Set('version', CURRENT_VERSION);
          }
          Message.Post(message.id, {
            'type': 'setTheme', 'data': Options.Get('windowTheme', function (id, value) {
              Message.PostAll({
                'type': 'setTheme', 'data': value
              });
              Time.UpdateAlertColor();
            })
          });
          break;
        case 'debug':
          Message.Notify('hey', 'its me ur brother', 'apNotifications');
          APBP.SetMax();
          break;
        case 'weaponBuild':
          Supplies.BuildWeapon(message.id, data);
          break;
        case 'removeItem':
          Supplies.RemoveInvalidItem(data);
          break;
        case 'toggleTracking':
          Supplies.ToggleTracking(data.category, data.id);
          break;
        case 'consoleLog':
          console.log(data);
          break;
        default:
          console.log("Unhandled message type: " + type);
          break;
      }
    };
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
      port.onMessage.removeListener(extensionListener);

      if (port.name === 'content') {
        var tabs = Object.keys(connectionsContent);
        for (var i = 0, len = tabs.length; i < len; i++) {
          if (connectionsContent[tabs[i]].port == port) {
            if (tabs[i] == corePanelID) {
              corePanelID = null;
            }
            delete connectionsContent[tabs[i]];
            break;
          }
        }
      } else {
        var tabs = Object.keys(connections);
        for (var i = 0, len = tabs.length; i < len; i++) {
          if (connections[tabs[i]].port == port) {
            if (tabs[i] == corePanelID) {
              corePanelID = null;
            }
            delete connections[tabs[i]];
            break;
          }
        }
      }
      if (corePanelID !== null) {
        var connectionIDs = [];
        for (var i in connections) {
          if (connections.hasOwnProperty(i) && connections[i].isDev) {
            connectionIDs.push(i);
          }
        }
        Message.Post(corePanelID, { 'type': 'updateConnections', 'data': connectionIDs });
      }
    });
  });

// TODO: I think this is supposed to be the contents of message.js
  window.Message = {
    PostAll: function(message) {
      Object.keys(connections).forEach(function(key) {
        if (message !== undefined) {
          if (message.type === 'openURL') {
            if (connections[key].isDev) {
              connections[key].port.postMessage(message);
            }
          } else {
            connections[key].port.postMessage(message);
          }
        }
      });
    },

    Post: function(id, message) {
      if (connections[id] !== undefined) {
        if (message !== undefined) {
          if (message.type === 'openURL') {
            if (connections[id].isDev) {
              connections[id].port.postMessage(message);
            }
          } else {
            connections[id].port.postMessage(message);
          }
        }
        return true;
      } else {
        return false;
      }
    },

    Notify: function(title, message, source) {
      if (Options.Get('enableNotifications') && Options.Get(source)) {
        var theme = Options.Get('notificationTheme');
        if (theme === 'Random') {
          var rand = Math.random() * 3;
          if (rand < 1) {
            theme = 'Sheep';
          } else if (rand < 2) {
            theme = 'Rooster';
          } else {
            theme = 'Monkey';
          }
        }
        if (new Date().getMonth() === 3 && new Date().getDate() === 1) {
          theme = 'Garbage';
        }
        if (!Options.Get('muteNotifications')) {
          var sound = new Audio('src/assets/sounds/' + theme + '.wav');
          sound.play();
        }
        if (Math.random() * 300 < 1) {
          theme += '2';
        }
        chrome.notifications.create({
          type:   'basic',
          title:   title,
          message: message,
          iconUrl: 'src/assets/images/' + theme + '.png'
        });
      }
    },

    OpenURL: function (url, devID) {
      //chrome.runtime.sendMessage({openURL: {
      //  url: url
      //}});
      chrome.tabs.get(devID, function(tab) {
        if (tab.url.indexOf('http://game.granbluefantasy.jp/') !== -1) {
          chrome.tabs.update(tab.id, { 'url': 'http://game.granbluefantasy.jp/' + url });
        } else if (tab.url.indexOf('http://gbf.game.mbga.jp/') !== -1) {
          chrome.tabs.update(tab.id, { 'url': 'http://gbf.game.mbga.jp/' + url });
        }
      })
    },

    MessageBackground: function(message, sendResponse) {
    },

    MessageTabs: function(message, sendResponse) {
      chrome.runtime.sendMessage({tabs: message}, function(response) {
        sendResponse(response);
      });
    },

    ConsoleLog: function(sender, message) {
      chrome.runtime.sendMessage({consoleLog: {
        sender: sender,
        message: message
      }});
    }
  };

})();
