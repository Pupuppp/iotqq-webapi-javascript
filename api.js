const request = require("request-promise");
var InterfaceConfig = require("./interface");

const ReplaceValue = (Host, QQ, Url) => {
  return Url.replace("$Host", Host).replace("$QQ", QQ);
};
const GetLdw = Skey => {
  let n = 5381;
  for (i = 0; i < Skey.length; i++) {
    n += (n << 5) + String(Skey[i]).charCodeAt();
  }
  return (n & 2147483647).toString();
};
class BaseInterface {
  constructor(Host) {
    this.Host = Host;
    let FunctionNameList = Object.keys(InterfaceConfig);
    FunctionNameList.map(FunctionName => {
      if (InterfaceConfig[FunctionName].Method === "GET") {
        this[FunctionName] = async Params => {
          let Api = ReplaceValue(
            this.Host,
            this.QQ,
            InterfaceConfig[FunctionName].Url
          );
          return request({
            url: Api,
            method: InterfaceConfig[FunctionName].Method
          });
        };
      } else {
        this[FunctionName] = async Params => {
          let InterfaceParams = {};
          InterfaceConfig[FunctionName].Params.map(Value2 => {
            let { Required, ParamsName, ParamsType } = Value2;
            if (Required) {
              if (Params.hasOwnProperty(ParamsName)) {
                /* 检查参数是否存在 */

                if (typeof (Params[ParamsName] === ParamsType)) {
                  /* 检查参数类型 */
                  InterfaceParams[ParamsName] = Params[ParamsName];
                } else {
                  throw new Error("Params type error");
                }
              } else {
                throw new Error("Params error");
              }
            }
          });

          let Api = ReplaceValue(
            this.Host,
            this.QQ,
            InterfaceConfig[FunctionName].Url
          );
          return request({
            url: Api,
            method: InterfaceConfig[FunctionName].Method,
            body: InterfaceParams,
            json: true
          });
        };
      }
    });
  }
  SetCurrentQQ(QQ) {
    this.QQ = QQ;
  }
  /**
   *
   *
   * @param {*} Params {toUser:<int>,content:<string>,atUser:<int>}
   * @memberof Interface
   */
  async SendFriendMsgText(Params) {
    let Default = {
      sendToType: 1,
      groupid: 0,
      sendMsgType: "TextMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }

  /**
   *
   *
   * @param {*} Params {toUser:<int>,content:<string>,atUser:<int>,picUrl:<string>,picBase64Buf:<string>,fileMd5:<string>}
   * @memberof Interface
   */
  async SendFriendMsgImage(Params) {
    let Default = {
      sendToType: 1,
      groupid: 0,
      sendMsgType: "PicMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }

  /**
   *
   * silk文件格式
   * @param {*} Params  {toUser:<int>,content:<string>,atUser:<int>,voiceUrl:<string>,"voiceBase64Buf":<string>}
   * @memberof Interface
   */
  async SendFriendMsgVoice(Params) {
    let Default = {
      sendToType: 1,
      groupid: 0,
      sendMsgType: "VoiceMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }

  async SendGroupMsgText(Params) {
    let Default = {
      sendToType: 2,
      groupid: 0,
      sendMsgType: "TextMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }

  async SendGroupMsgImage(Params) {
    let Default = {
      sendToType: 2,
      groupid: 0,
      sendMsgType: "PicMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }

  async SendGroupMsgVoice(Params) {
    let Default = {
      sendToType: 2,
      groupid: 0,
      sendMsgType: "VoiceMsg"
    };
    Object.assign(Params, Default);
    return this.SendMsg(Params);
  }
  /**
   *
   *
   * @param {*} Skey
   * @param {*} Params
   * { num: '20',
     page: '0',
     sessionid: '0', 默认0
     keyword: '1',
     agerg: '0',
     sex: '0',
     firston: '1',
     video: '0',
     country: '0',
     province: '0',
     city: '0',
     district: '0',
     hcountry: '0',
     hprovince: '0',
     hcity: '0',
     hdistrict: '0',
     online: '1',
     ldw: '' } 由GetLdw计算得  Skey 从cookie获取 去掉@
   * @memberof BaseInterface
   */
  async FindUser(Skey, Params) {
    let QQ = this.QQ;
    let Url =
      "https://find.qq.com/proxy/domain/cgi.find.qq.com/qqfind/buddy/search_v3";
    let Headers = {
      host: "find.qq.com",
      connection: "keep-alive",
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://find.qq.com",
      "user-agent":
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) QQ/9.2.2.26571 Chrome/43.0.2357.134 Safari/537.36 QBCore/3.43.1284.400 QQBrowser/9.0.2524.400",
      "x-requested-with": "XMLHttpRequest",
      "accept-language": "en-US,en;q=0.8",
      cookie: `uin=o${QQ}; skey=${Skey}`,
      "cache-control": "no-cache"
    };
    let Ldw = GetLdw(Skey);
    Params.ldw = Ldw;
    let Options = {
      method: "POST",
      url: Url,
      headers: Headers,
      form: Params
    };
    return request(Options);
  }
  /**
   *
   *
   * @param {*} Skey
   * @param {*} Params
   * { k: '交友',
     n: '8',
     st: '1',
     iso: '1',
     src: '1',
     v: '5683', 版本
     bkn: '',  同ldw
     isRecommend: 'false',
     city_id: '0',
     from: '1',
     newSearch: 'true',
     penetrate: '',
     keyword: '1',
     sort: '0',
     wantnum: '24',
     page: '0',
     ldw: '' } 同ldw
   * @memberof BaseInterface
   */
  async FindGroup(Skey, Params) {
    let QQ = this.QQ;
    let Url = "https://qun.qq.com/cgi-bin/group_search/pc_group_search";
    let Headers = {
      connection: "keep-alive",
      accept: "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded",
      origin: "https://find.qq.com",
      "user-agent":
        "Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) QQ/9.2.2.26571 Chrome/43.0.2357.134 Safari/537.36 QBCore/3.43.1284.400 QQBrowser/9.0.2524.400",
      "x-requested-with": "XMLHttpRequest",
      "accept-language": "en-US,en;q=0.8",
      cookie: `uin=o${QQ}; skey=${Skey}`,
      "cache-control": "no-cache"
    };
    let Ldw = GetLdw(Skey);
    Params.ldw = Ldw;
    Params.bkn = Ldw;

    let Options = {
      method: "POST",
      url: Url,
      headers: Headers,
      form: Params
    };
    return request(Options);
  }
}
module.exports = { BaseInterface };
