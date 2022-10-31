(function() {
  var profile = {
    lupi:             null,
    level:            1,
    levelPercent:     null,
    levelNextExp:     null,
    job:              null,
    jobPercent:       null,
    jobNextExp:       null,
    jobPoints:        null,
    zenith:           null,
    zenithPercent:    null,
    zenithNextExp:    null,
    renown:           null,
    prestige:         null,
    arcarumTicket:    null,
    arcarumTicketMax: 7,
    arcapoints:       null,
    casinoChips:      null,
    weaponNumber:     null,
    weaponMax:        null,
    summonNumber:     null,
    summonMax:        null,
    characterNumber:  null,
    drops:            null,
    crystal:          null,
    defenseBadges:    null,
    defenseRank:      null,
    sparks:           null,
  };

  var renownMax       = 20000;
  var prestigeMax     = 5000;
  var arcapointsMax   = 50000;

  var responseList    = {};
  var restoreIDs      = ['1','2','3','5'];

  var profileNames    = [];
  var nextUncap       = null;
  var nextCost        = 0;
  var nextUpgrade     = null;
  var reduceReturnURL = {};

  var pendingTuples   = {};

  window.Profile = {
    Initialize: function(callback) {
      for (var i = 0; i < restoreIDs.length; i++) {
        Supplies.Get(restoreIDs[i], 'recovery', function(id, amt) {
          Message.PostAll({
            'type': 'setText',
            'data': {
              'id': '#profile-' + id,
              'value': amt
            }
          });
        });
      }
      Storage.Get(['profile'], function(response) {
        if (response['profile'] !== undefined) {
          profile = response['profile'];
        } else {
          Storage.Set('profile', profile);
        }
        Object.keys(responseList).forEach(function(key) {
          for (var i = 0; i < responseList[key].length; i++) {
            responseList[key][i](profile[key]);
          }
        });
        if (callback !== undefined) {
          callback();
        }
      });

    },
    InitializeDev: function() {
      var response = [];
      Object.keys(profile).forEach(function(key) {
        response.push(getJquery(key));
      });
      for (var i = 0; i < restoreIDs.length; i++) {
        response.push({
          'type': 'setText',
          'data': {
            'id': '#profile-' + restoreIDs[i],
            'value': Supplies.Get(restoreIDs[i], 'recovery')
          }
        });
      }
      return response;
    },

    Get: function(category, response) {
      if (response !== undefined) {
        if (responseList[category] === undefined) {
          responseList[category] = [];
        }
        responseList[category].push(response);
        response(profile[category]);
      }
      if (profile[category] !== undefined) {
        return profile[category];
      }
    },

    CompleteQuest: function (json, raidTuples) {
      if (json === undefined || json === null) {
        return;
      }
      if (json.popup_data && !json.popup_data.response) {
        return;
      }
      var tuples = {};
      if (raidTuples !== undefined) {
        tuples = raidTuples;
      }
      tuples['lupi'] = profile['lupi'] + json.rewards.lupi;
      if (json.values.pc_levelup.is_levelup) {
        var remain = 0;
        for (var i = 1; i <= json.values.pc.param.new.level; i++) {
          if (json.values.pc.param.next_exp_list['' + i] !== undefined) {
            remain += json.values.pc.param.next_exp_list['' + i];
          }
        }
        tuples['levelNextExp'] =  remain - json.values.pc.param.new.exp;
        APBP.SetMax();
      } else {
        tuples['levelNextExp'] = parseInt(json.values.pc.param.remain_next_exp) - (parseInt(json.values.get_exp.exp) + parseInt(json.values.get_exp.exp_bonus));
      }
      tuples['level'] = json.values.pc.param.new.level;
      tuples['levelPercent'] = json.values.pc.param.new.exp_width + '%';

      if (profile['job'] !== json.values.pc.job.new.level) {
        var remain = 0;
        for (var i = 1; i <= json.values.pc.job.new.level; i++) {
          if (json.values.pc.job.next_exp_list['' + i] !== undefined) {
            remain += json.values.pc.job.next_exp_list['' + i];
          }
        }
        tuples['jobNextExp'] = remain - json.values.pc.job.new.exp;
      } else {
        tuples['jobNextExp'] = parseInt(json.values.pc.job.remain_next_exp) - (parseInt(json.values.get_exp.job_exp) + parseInt(json.values.get_exp.job_exp_bonus));
      }
      tuples['job']        = json.values.pc.job.new.level;
      tuples['jobPercent'] = json.values.pc.job.new.exp_width + '%';
      if (tuples['job'] === 20) {
        tuples['zenith']        = parseInt(json.values.pc.job.zenith.after_lp);
        tuples['zenithPercent'] = json.values.pc.job.zenith.after_exp_gauge + '%';
        tuples['zenithNextExp'] = profile['zenithNextExp'] -(parseInt(json.values.get_exp.job_exp) + parseInt(json.values.get_exp.job_exp_bonus));
      }
      if (json.arcarum_info !== undefined) {
        tuples['arcapoints'] = profile['arcapoints'] + parseInt(json.arcarum_info.point);
      }
      setProfile(tuples);
      Profile.GetLoot(json);
    },

    CompleteRaid: function (json) {
      if (json === undefined || json === null) {
        return;
      }
      if (json.popup_data && !json.popup_data.response) {
        return;
      }
      var path;
      var tuples = {};
      var ids    = ['10100', '20100', '20200'];
      if (!Array.isArray(json.mbp_info) && json.mbp_info !== undefined) {
        tuples['renown']   = profile['renown'];
        tuples['prestige'] = profile['prestige'];
        for (var i = 0; i < ids.length; i++) {
          if (json.mbp_info.add_result[ids[i]] !== undefined) {
            path = json.mbp_info.add_result[ids[i]];
            if (path.add_point !== 0) {
              if (path.mbp_id === '4') {
                tuples['prestige'] += path.add_point;
                break;
              } else {
                tuples['renown'] += path.add_point;
              }
            }
          }
        }
      }
      Profile.CompleteQuest(json, tuples);
    },

    SetChips: function(amount) {
      setProfile({'casinoChips': parseInt(amount)});
    },

    SetWeaponNumber: function(json, url, devID) {
      var tuples             = {};
      tuples['weaponMax']    = parseInt(json.options.max_number);
      tuples['weaponNumber'] = json.options.number;

      setProfile(tuples);

      if (Options.Get('skipUpgradeResults')) {
        var match = url.match(/\/weapon\/list\/(\d\/\d)\?/);
        if (match !== null && match.length > 1) {
          reduceReturnURL[devID] = '#list/-1/' + match[1] + '/1';
        } else {
          console.log(url);
        }
      }
    },

    SetSummonNumber: function(json, url, devID) {
      var tuples             = {};
      tuples['summonMax']    = parseInt(json.options.max_number);
      tuples['summonNumber'] = json.options.number;

      setProfile(tuples);

      if (Options.Get('skipUpgradeResults')) {
        var match = url.match(/\/summon\/list\/(\d\/\d)\?/);
        if (match !== null && match.length > 1) {
          reduceReturnURL[devID] = '#list/-1/' + match[1] + '/2';
        } else {
          console.log(url);
        }
      }
    },

    SetCharacterNumber: function(json, url) {
      if (url.indexOf('/1/0?') !== -1) {
        for (var key in json.options.filter) {
          if (json.options.filter.hasOwnProperty(key)) {
            if (parseInt(json.options.filter[key]) !== 0) {
              return;
            }
          }
        }
        setProfile({'characterNumber': json.options.number});
      }
    },

    Reduce: function(json, devID) {
      if (Options.Get('skipUpgradeResults')) {
        if (reduceReturnURL[devID] !== undefined) {
          Message.OpenURL(reduceReturnURL[devID], devID);
          //Message.Post(devID, { 'type': 'openURL', 'data': reduceReturnURL[devID] });
        }
      }
    },

    MoveFromStash: function(json) {
      var tuples = {};
      var type;
      if (json.from_name.indexOf('Weapon') !== -1) {
        type = 'weapon';
      } else if (json.from_name.indexOf('Summon') !== -1) {
        type = 'summon';
      }
      tuples[type + 'Max']    = parseInt(json.to_max_number);
      tuples[type + 'Number'] = json.to_number;
      setProfile(tuples);
    },

    MoveToStash: function(json) {
      var tuples = {};
      var type;
      if (json.to_name.indexOf('Weapon') !== -1) {
        type = 'weapon';
      } else if (json.to_name.indexOf('Summon') !== -1) {
        type = 'summon';
      }
      tuples[type + 'Max']    = parseInt(json.from_max_number);
      tuples[type + 'Number'] = json.from_number;
      setProfile(tuples);
    },

    SetLupiCrystal: function (json) {
      if (json === undefined || json === null) {
        return;
      }
      var tuples = {};
      if (json.mydata !== undefined && json.mydata.possessed) {
        if (json.mydata.notice !== undefined && json.mydata.trajectory_drop !== undefined) {
          tuples['drops'] = profile['drops'] + parseInt(json.mydata.notice.trajectory_drop);
        }
        tuples['lupi']    = parseInt(json.mydata.possessed.lupi);
        tuples['crystal'] = parseInt(json.mydata.possessed.stone);
        setProfile(tuples);
      } else if (json.option !== undefined && json.option.mydata_assets !== undefined && json.option.mydata_assets.mydata !== undefined && json.option.mydata_assets.mydata.possessed) {
        tuples['lupi']    = parseInt(json.option.mydata_assets.mydata.possessed.lupi);
        tuples['crystal'] = parseInt(json.option.mydata_assets.mydata.possessed.stone);
        setProfile(tuples);
      }
    },

    LupiDraw: function(json) {
      var tuples             = {};
      tuples['weaponMax']    = parseInt(json.user_info.weapon_max);
      tuples['weaponNumber'] = parseInt(json.user_info.weapon_count);
      tuples['summonMax']    = parseInt(json.user_info.summon_max);
      tuples['summonNumber'] = parseInt(json.user_info.summon_count);
      tuples['lupi']         = parseInt(json.user_info.money);
      tuples['crystal']      = parseInt(json.user_info.user_money);
      setProfile(tuples);
    },

    SetDrops: function(json) {
      var tuples        = {};
      tuples['crystal'] = parseInt(json.amount);
      tuples['drops']   = parseInt(json.trangect_drop);
      setProfile(tuples);
    },

    SetDefense: function(json) {
      var tuples = {};
      if (json.defendorder_point_total !== undefined) {
        tuples['defenseBadges'] = parseInt(json.defendorder_point_total);
      }
      if (json.defendorder_title !== undefined) {
        tuples['defenseRank'] = parseInt(json.defendorder_title.level);
      }
      setProfile(tuples);
    },

    SpendCrystals: function(json) {
    },

    SetHomeProfile: function (rank, rankPercent, job, jobPercent, lupi, jobPoints, crystal, renown, prestige, arcarumTicket, arcapoints) {
      var tuples = {};

      tuples['level'] = rank;
      if (rankPercent !== undefined) {
        tuples['levelPercent'] =  rankPercent.substring(rankPercent.indexOf(': ') + 2, rankPercent.indexOf(';'));
      }

      tuples['job'] = parseInt(job);
      if (jobPercent !== undefined) {
        if (profile['job'] === 20) {
          tuples['zenithPercent'] = jobPercent.substring(jobPercent.indexOf(': ') + 2, jobPercent.indexOf(';'));
        } else {
          tuples['jobPercent'] = jobPercent.substring(jobPercent.indexOf(': ') + 2, jobPercent.indexOf(';'));
        }
      }
      
      tuples['lupi'] = parseInt(lupi);
      tuples['jobPoints'] = parseInt(jobPoints);
      tuples['crystal'] = parseInt(crystal);
      tuples['renown'] = parseInt(renown);
      tuples['prestige'] = parseInt(prestige);
      tuples['arcarumTicket'] = parseInt(arcarumTicket.substring(0, arcarumTicket.indexOf('/')));
      tuples['arcarumTicketMax'] = parseInt(arcarumTicket.substring(arcarumTicket.indexOf('/') + 1, arcarumTicket.length));
      tuples['arcapoints'] = parseInt(arcapoints.substring(0, arcapoints.indexOf('/')));

      for (var key in tuples) {
        if (tuples.hasOwnProperty(key)) {
          if (isNaN(tuples[key])) {
            delete tuples[key];
          }
        }
      }

      setProfile(tuples);
    },

    AddLupi: function(amt) {
      setProfile({'lupi': profile['lupi'] + parseInt(amt)});
    },

    AddArcapoints: function(amt) {
      setProfile({ 'arcapoints': profile['arcapoints'] + parseInt(amt) });
    },

    CheckWeaponSummon: function(json) {
      var tuples             = {};
      tuples['weaponMax']    = parseInt(json.weapon_count.max_count);
      tuples['weaponNumber'] = json.weapon_count.current_count;
      tuples['summonMax']    = parseInt(json.summon_count.max_count);
      tuples['summonNumber'] = json.summon_count.current_count;
      setProfile(tuples);
    },

    GetLoot: function(json) {
      var item;
      var list;
      var rewards;
      var tuples = {};
      var log = {};
      log.time = Date.now();
      log.items = {};

      if (json.rewards) {
        rewards = json.rewards;
        if (rewards.reward_list) {
          list = json.rewards.reward_list;
          for (var property in list) {
            if (list.hasOwnProperty(property)) {
              if (list[property].length) {
                // old reward data json structure
                for (var i = 0; i < list[property].length; i++) {
                  item = list[property][i];
                  var category = getCategory(item.item_kind);
                  if (category !== undefined) {
                    log = logItem(log, item.id, item.name, 1, 0);
                    if (tuples[category] === undefined) {
                      tuples[category] = profile[category] + 1;
                    } else {
                      tuples[category]++;
                    }
                  }
                }
              } else {
                for (var key in list[property]) {
                  if (list[property].hasOwnProperty(key)) {
                    item = list[property][key];
                    var category = getCategory(item.item_kind);
                    if (category !== undefined) {
                      log = logItem(log, item.id, item.name, parseInt(item.count), property);
                      if (tuples[category] === undefined) {
                        tuples[category] = profile[category] + parseInt(item.count);
                      } else {
                        tuples[category] += parseInt(item.count);
                      }
                    } else {
                      console.log("unknown item_kind: '" + item.item_kind + "'");
                      console.log(item);
                    }
                  }
                }
              }
            }
          }
        }

        if (rewards.article_list) {
          list = json.rewards.article_list;
          for (var property in list) {
            if (list.hasOwnProperty(property)) {
              item = list[property];
              var category = getCategory('' + item.kind);
              if (category !== undefined) {
                log = logItem(log, item.id, item.name, parseInt(item.count), 0);
                if (tuples[category] === undefined) {
                  tuples[category] = profile[category] + parseInt(item.count);
                } else {
                  tuples[category] += parseInt(item.count);
                }
              }
            }
          }
        }

        if (json.character_message && json.character_message.ability_item_info) {
          list = json.character_message.ability_item_info;
          if (list.length) {
            for (var i = 0; i < list.length; i++) {
              item = list[i];
              var category = getCategory('' + item.item_kind);
              if (category !== undefined) {
                log = logItem(log, item.item_id, item.item_name, parseInt(item.number), 99);
                if (tuples[category] === undefined) {
                  tuples[category] = profile[category] + parseInt(item.number);
                } else {
                  tuples[category] += parseInt(item.number);
                }
              }
            }
          }
        }

        Message.PostAll({
          'type': 'logItem',
          'data': log
        });
        setProfile(tuples);
      }
    },

    ReceiveGift: function(json) {
      var category = getCategory(json.item_kind_id);
      if (category !== undefined) {
        setProfile({[category]: profile[category] + parseInt(json.number)});
      }
    },

    GetAllGifts: function(json, devID) {
      var item;
      var category;
      pendingTuples[devID] = {};
      for (var i = 0; i < json.presents.length; i++) {
        item = json.presents[i];
        category = getCategory(item.item_kind_id);
        if (category !== undefined) {
          if (pendingTuples[devID][category] === undefined) {
            pendingTuples[devID][category] = profile[category] + parseInt(item.number);
          } else {
            pendingTuples[devID][category] += parseInt(item.number);
          }
        }
      }
    },

    ReceiveAllGifts: function (json, devID) {
      setProfile(pendingTuples[devID]);
      pendingTuples[devID] = {};
    },

    SetUncapItem: function(json) {
      nextUncap = null;
    },

    SetUncap: function(json, url) {
      if (url.indexOf('weapon') !== -1) {
        nextUncap = 'weaponNumber';
      } else if (url.indexOf('summon') !== -1) {
        nextUncap = 'summonNumber';
      }
    },

    Uncap: function(json, url, devID) {
      if (nextUncap !== null) {
        setProfile({[nextUncap]: profile[nextUncap] - 1});
      }

      if (Options.Get('skipUpgradeResults')) {
        if (url.indexOf('confirm') !== -1 && url.indexOf('#evolution') !== -1) {
          var redirecturl = '';
          if (url.indexOf('confirm/') !== -1) {
            if (json.base && json.base.id) {
              redirecturl = '#' + url.split('#')[1].replace('confirm/', 'material/' + json.base.id + '/');
            }
          } else {
            redirecturl = '#' + url.split('#')[1].replace('confirm', 'material');
          }
          Message.OpenURL(redirecturl, devID);
        }
      }
    },

    SetUncapCost: function(json) {
      nextCost = parseInt(json.cost);
      setProfile({'lupi': parseInt(json.amount)});
    },

    BuyUncap: function() {
      setProfile({'lupi': nextCost});
    },

    SetUpgrade: function(json, url) {
      var category;
      if (url.indexOf('weapon') !== -1 || url.indexOf('npc') !== -1) {
        category = 'weaponNumber';
      } else if (url.indexOf('summon') !== -1) {
        category = 'summonNumber';
      }

      nextUpgrade = {
        'amount':   json.material_list.length,
        'category': category
      };
    },

    Upgrade: function(json, url, devID) {
      if (nextUpgrade !== undefined) {
        setProfile({[nextUpgrade.category]: profile[nextUpgrade.category] -nextUpgrade.amount});
      }
      if (Options.Get('skipUpgradeResults')) {
        if (url.indexOf('material') !== -1 && url.indexOf('#enhancement') !== -1) {
          var redirecturl = '';
          if (url.indexOf('material/') !== -1) {
            if (json.base && json.base.id) {
              redirecturl = '#' + url.split('#')[1].replace('material/', 'list_all/' + json.base.id + '/');
            }
          } else {
            redirecturl = '#' + url.split('#')[1].replace('material', 'list_all');
          }
          Message.OpenURL(redirecturl, devID);
        }
      }
    },

    PurchaseItem: function(json) {
      var dir;
      var amt;
      if (json.article) {
        if (json.article.article1 && json.article.article1.master) {
          dir = json.article.article1;
          amt = parseInt(dir.has_number) - parseInt(json.article.article1_number) * json.purchase_number;
          if (dir.master.id === '92001') {
            setProfile({ 'renown': amt });
          } else if (dir.master.id === '92002') {
            setProfile({ 'prestige': amt });
          }
        } else {
          dir = json.article;
          // arcarum shop
          if (dir.has_point) {
            // arcarum max ticket id = 3001 (json.article.id)
            amt = parseInt(dir.has_point) - parseInt(dir.point) * json.purchase_number;
            setProfile({ 'arcapoints': amt });

            // arcarum max ticket
            var id = '' + dir.id;
            if (id === '3001' && json.purchase_number > 0) {
              setProfile({ 'arcarumTicketMax': profile['arcarumTicketMax'] + json.purchase_number });
            }
          }
        }
      }
    },

    SetZenith: function (json) {
      var zenith = null;
      if (json.job !== undefined &&
          json.job.zenith !== undefined &&
          json.job.zenith.lp_amount !== undefined) {
        zenith = json.job.zenith.lp_amount;
      }
      if (zenith !== null) {
        var amt = parseInt(zenith);
        setProfile({ 'zenith': amt });
      }
    },

    ProcessArcarumStage: function(json) {
      var tuples = {};
      if (json.passport_num) {
        tuples['arcarumTicket'] = parseInt(json.passport_num);
      }
      if (json.point) {
        tuples['arcapoints'] = parseInt(json.point);
      }
      setProfile(tuples);
    }
  };

  getCategory = function(item_kind) {
    switch (item_kind) {
      case '1':
        return 'weaponNumber';
      case '2':
        return 'summonNumber';
      case '3':
        return 'characterNumber';
      case '7':
        return 'lupi';
      case '9':
        return 'crystal';
      case '19':
        return 'jobPoints';
      case '31':
        return 'casinoChips';
      case '40':
        return 'zenith';
      case '59':
        return 'defenseBadges';
      default:
        return undefined;
    }
  };

  var logItem = function (log, id, name, number, chest) {
    if (log.items[chest] === undefined) {
      log.items[chest] = {};
    }
    if (log.items[chest][id] === undefined) {
      log.items[chest][id] = {};
    }
    if (log.items[chest][id].qty !== undefined) {
      log.items[chest][id].qty += number;
    } else {
      log.items[chest][id].qty = number;
    }
    log.items[chest][id].name = name;
    return log;
  };

  setProfile = function (tuples) {
    if (tuples === undefined || tuples === null) {
      return;
    }
    var updated = false;
    var value;
    var category;
    Object.keys(tuples).forEach(function(category) {
      value = tuples[category];
      if (value < 0) {
        value = 0;
      }

      if (category === 'weaponNumber') {
        if (value > profile['weaponMax']) {
          value = profile['weaponMax'];
        }
      } else if (category === 'summonNumber') {
        if (value > profile['summonMax']) {
          value = profile['summonMax'];
        }
      } else if (category === 'renown') {
        if (value > renownMax) {
          value = renownMax;
        }
      } else if (category === 'prestige') {
        if (value > prestigeMax) {
          value = prestigeMax;
        }
      } else if (category === 'arcapoints') {
        if (value > arcapointsMax) {
          value = arcapointsMax;
        }
      } else if (category === 'arcarumTicket') {
        if (value > profile['arcarumTicketMax']) {
          value = profile['arcarumTicketMax'];
        }
      }

      if (profile[category] !== value) {
        profile[category] = value;
        updated           = true;

        Message.PostAll(getJquery(category));

        if (category === 'crystal') {
          Message.PostAll({
            'type': 'setPlannerItemAmount',
            'data': {
              'id':       category,
              'sequence': 0,
              'current':  value
            }
          });
        }

        if (responseList[category] !== undefined) {
          for (var i = 0; i < responseList[category].length; i++) {
            responseList[category][i](value);
          }
        }
      }
    });

    if (updated) {
      Storage.Set('profile', profile);
    }
  };

  getJquery = function(category) {
    var value;
    if (category === 'jobNextExp' && profile.job === 20) {
      value = profile['zenithNextExp'];
    } else if (category === 'jobPercent' && profile.job === 20) {
      value = profile['zenithPercent'];
    } else if ((category === 'weaponMax' || category === 'weaponNumber') && profile['weaponNumber'] !== null && profile['weaponMax'] !== null) {
      value = profile['weaponNumber'] + '/' + profile['weaponMax'];
      category = 'weapon';
    } else if ((category === 'summonMax' || category === 'summonNumber') && profile['summonnNumber'] !== null && profile['summonMax'] !== null) {
      value = profile['summonNumber'] + '/' + profile['summonMax'];
      category = 'summon';
    } else {
      value = profile[category];
    }
    if (value === undefined || value === null) {
      value = '???';
    }
    if (category === 'zenithNextExp') {
      value = '';
    }
    if (category === 'zenithNextExp' && profile.job === 20) {
      category = 'jobNextExp';
    } else if ( category === 'zenithPercent') {
      category = 'jobPercent';
    }
    if (category === 'arcarumTicket') {
      value += '/' + profile['arcarumTicketMax'];
    }
    value = numberWithCommas(value);
    if (category === 'level') {
      value = 'Rank: ' + value;
    } else if (category === 'job') {
      value = 'Class: ' + value;
    } else if (category === 'levelPercent' || category === 'jobPercent') {
      if (value === '???') {
        value = 0;
      }
      return {
        'type': 'setBar',
        'data': {
          'id':    '#profile-' + category,
          'value': value
        }
      };
    }
    return {
      'type': 'setText',
      'data': {
        'id':    '#profile-' + category,
        'value': value
      }
    };
  };

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
})();
