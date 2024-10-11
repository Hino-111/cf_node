// @ts-nocheck

import { connect } from 'cloudflare:sockets';
let token = 'default';
let data = ``

let arr = [];
let node_type = '';
let password = '';
let address = '';
let port = '';
let security = '';
let net_type = '';
let host = '';
let node_name = '';
let encryption = '';
let obs_password = '';
let obfs = '';
let sum = 0;

export default {
  /**
	 * @param {import("@cloudflare/workers-types").Request} request
	 * @param {{TOKEN: string, DATA: string}} env
	 * @param {import("@cloudflare/workers-types").ExecutionContext} ctx
	 * @returns {Promise<Response>}
	 */
  async fetch(request, env, ctx) {
    token = env.TOKEN || token;
    data = env.DATA || data;
    sum = url_count(data);
    for (let i = 0; i < sum; i++)
    {
        arr.push(data.split('\n')[i]);   
    }
    const url = new URL(request.url);
    const clash_temp = clash_config();
    const singbox_temp = singbox_config();
    switch (url.pathname) {
      case '/':
        return new Response(`Not Found`);
      case `/${token}/v2ray`: {
        return new Response(`${v2rayntobase64(data)}`);
      }
      case `/${token}/clash`:
        return new Response(`${clash_temp}}`);
      case `/${token}/singbox`:
        return new Response(`${singbox_temp}`,{
          status: 200,
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          }
        });
      default:
        return new Response(`Not Found`);
    }
  },
};

/**
 * @param {string} str
 * @returns {string}
 */
function v2rayntobase64(str)
{
  const base64Encoded = btoa(str);
  return`${base64Encoded}`;
}

/**
 * @param {string} [str]
 * @returns {number}
 */
function url_count(str) {
  let matches = str.match(/\/\//g);  // 全局匹配所有\\
  return matches ? matches.length : 0;
}

/**
 * @param {string} str
 * @returns {string}
 */
function extractBase64(str) {
  let base64Regex = '';
  if(str.includes('=='))
  {
      base64Regex = /(([A-Za-z0-9]{4}){5,}([A-Za-z0-9]{2}==)?)/g;
  }else if(str.includes('??'))
  {   
      str = str.slice(0,str.length - 2) + '==';
      base64Regex = /(([A-Za-z0-9]{4}){5,}([A-Za-z0-9]{2}==)?)/g;
  }else if(str.includes('?'))
  {
      base64Regex = /(([A-Za-z0-9]{4}){5,}([A-Za-z0-9]{3}\?)?)/g;            
  }else{
      base64Regex = /(([A-Za-z0-9]{4}){5,}([A-Za-z0-9]{3}=)?)|(([A-Za-z0-9]{4}){5,}([A-Za-z0-9]{3}\?)?)/g;
  }
  let matches = str.match(base64Regex);
  if(!matches)
  {
      matches = ['null'];
  }
  if(matches[0].includes('?'))
  {
      matches = matches[0].slice(0,matches[0].length - 1) + '=';
  }else{
      matches = matches[0];
  }
  return matches;
}

/**
 * @param {number} index
 */
function get_config(index)
{
    let temp1 = ``
    let pos0 = ``
    let len = ``
    let rst0 = arr[index].indexOf(":");
    let rst1 = arr[index].indexOf(":");
    node_type = arr[index].slice(0, rst0);

    switch(node_type)
    {
        case 'ss':
            temp1 = extractBase64(arr[index]);
            if(temp1 != 'null')
            {
                pos0 = arr[index].indexOf(temp1.slice(0,10));
                len = temp1.length;
                temp1 = atob(temp1);
                arr[index] = arr[index].slice(0,pos0) + temp1 + arr[index].slice(pos0 + len,);
            }            
            // console.log(arr[index]);
            break;
        case 'vmess':
            temp1 = extractBase64(arr[index]);           
            if(temp1 != 'null')
            {
                if(arr[index].includes('remarks='))
                {
                    pos0 = arr[index].indexOf(temp1.slice(0,10));
                    len = temp1.length;
                    temp1 = atob(temp1);
                    arr[index] = arr[index].slice(0,pos0) + temp1 + arr[index].slice(pos0 + len,);
                    if(!arr[index].includes('?'))
                    {
                        arr[index] = arr[index].slice(0, pos0 + temp1.length) + '?' + arr[index].slice(pos0 + temp1.length,);
                    }
                    rst0 = arr[index].indexOf(":");
                    rst1 = arr[index].indexOf(":", rst0 + 1);
                    encryption = arr[index].slice(rst0 + 3, rst1);
                    rst0 = arr[index].indexOf("@");
                    password = arr[index].slice(rst1 + 1, rst0);
                    rst1 = arr[index].indexOf(":", rst1 + 1);
                    address = arr[index].slice(rst0 + 1, rst1);
                    rst0 = arr[index].indexOf("?");
                    port = arr[index].slice(rst1 + 1, rst0);
                    if(arr[index].includes('Host'))
                    {
                        rst0 = arr[index].indexOf("Host");
                        rst1 = arr[index].indexOf("&path");
                        host = arr[index].slice(rst0 + 11, rst1 - 6);
                    }else if(arr[index].includes('peer')){
                        rst0 = arr[index].indexOf("peer");
                        rst1 = arr[index].indexOf("&a");
                        host = arr[index].slice(rst0 + 5, rst1);
                    }
                    
                    if(arr[index].includes('obfs=websocket'))
                    {
                        net_type = 'ws';

                    }else if(arr[index].includes('obfs=none')){
                        net_type = 'tcp';
                    }
                    if(arr[index].includes('tls=1'))
                    {
                        security = 'true';
                    }else{
                        security = 'false';
                    }
                    // console.log(arr[index]);
                }else{
                    temp1 = atob(temp1);
                    const regular = /[\.a-zA-Z0-9_-]+/g; 
                    const matches = temp1.match(regular);
                    // console.log(matches);
                    address = matches[5];
                    port = matches[7];
                    password = matches[9];
                    port = matches[7];
                    encryption = matches[13];
                    net_type = matches[15];
                    host = matches[19];
                    rst0 = matches.indexOf('tls');
                    if(matches[rst0 + 1] == 'tls')
                    {
                        security = 'true';
                    }else{
                        security = 'false';
                    }
                    // console.log(password);
                }  
            }
            break;
        case 'hysteria2':
            temp1 = extractBase64(arr[index]);
            if(temp1 != 'null')
            {
                pos0 = arr[index].indexOf(temp1.slice(0,10));
                len = temp1.length;
                temp1 = atob(temp1);
                arr[index] = arr[index].slice(0,pos0) + temp1 + arr[index].slice(pos0 + len,);
            }
            pos0 = arr[index].indexOf('?');
            arr[index] = arr[index].slice(0,pos0 - 1) + arr[index].slice(pos0,)
            // console.log(arr[index]);
        
        default:
            temp1 = extractBase64(arr[index]);
            if(temp1 != 'null')
                {
                    pos0 = arr[index].indexOf(temp1.slice(0,10));
                    len = temp1.length;
                    temp1 = atob(temp1);
                    arr[index] = arr[index].slice(0,pos0) + temp1 + arr[index].slice(pos0 + len,);
                }
            break;           
    }
    rst0 = arr[index].indexOf(":");
    rst1 = arr[index].indexOf(":", rst0 + 1);   
    if(node_type == 'ss')
    {
        encryption = arr[index].slice(rst0 + 3, rst1);   
        rst0 = arr[index].indexOf("@");
        password = arr[index].slice(rst1 + 1, rst0);
        rst1 = arr[index].lastIndexOf(":");
        address = arr[index].slice(rst0 + 1, rst1);
        rst0 = arr[index].indexOf("#");
        port = arr[index].slice(rst1 + 1, rst0);
        node_name = arr[index].slice(rst0 + 1,);
        net_type = 'tcp'
        host = '';
    }else if(node_type != 'vmess'){
        rst0 = arr[index].indexOf(":");
        rst1 = arr[index].indexOf("@");
        password = arr[index].slice(rst0+3, rst1);
        rst0 = arr[index].lastIndexOf(":");
        address = arr[index].slice(rst1+1, rst0);
        rst1 = arr[index].indexOf("?");
        port = arr[index].slice(rst0+1, rst1); 
        if(arr[index].includes('security=tls'))
            {
                security = 'true';
            }else{
                security = 'false';
            }
        if(arr[index].includes('type=ws'))
            {
                net_type = 'ws';
            }else if(arr[index].includes('type=tcp'))
            {
                net_type = 'tcp';
            }
        if(arr[index].includes('host'))
        {
            rst0 = arr[index].indexOf("host");
            rst1 = arr[index].lastIndexOf('&');
            if(rst0 < rst1)
                {
                    host = arr[index].slice(rst0+5, rst1);
                }else
                {
                    rst1 = arr[index].lastIndexOf('#');
                    host = arr[index].slice(rst0+5, rst1);
                }
        }else if(arr[index].includes('sni')){
            rst0 = arr[index].indexOf("sni");
            rst0 = rst0 - 1;
            rst1 = arr[index].lastIndexOf('&');
            if(rst0 < rst1)
                {
                    host = arr[index].slice(rst0+5, rst1);
                }else
                {
                    rst1 = arr[index].lastIndexOf('#');
                    host = arr[index].slice(rst0+5, rst1);
                }
        }else{
            host = '';
        }
        if(node_type == 'hysteria2')
        {
            rst0 = arr[index].indexOf('sni');
            rst1 = arr[index].indexOf('&');
            host = host = arr[index].slice(rst0 + 4, rst1);
            
           
            if(arr[index].includes('obfs-password'))
            {
                rst0 = arr[index].indexOf('obfs-password'); 
                rst1 = arr[index].lastIndexOf('&');
                obs_password = arr[index].slice(rst0 + 14, rst1);
                obfs = 'salamander';
            }else{
                obs_password = '';
                obfs = '';
            }
            
        }else{
            obs_password = '';
            obfs = '';
        }
        rst0 = arr[index].lastIndexOf('#');
        node_name = arr[index].slice(rst0+1,);
    }
}
/**
 * @returns {string} 
 */
function clash_config()
{
    let node_config = ``;
    let groups_node = ``;
    let temp = ``;
    for (let i = 0; i < sum; i++) 
        {
            get_config(i);
            switch (node_type) {
                case 'vless':
                    temp =
`- name: ${node_name}
  type: ${node_type}
  server: ${address}
  port: ${port}
  uuid: ${password}
  udp: true
  tls: ${security}
  network: ${net_type}
  servername: ${host}
  ws-opts:
    path: "/?ed=2048"
    headers:
      Host: ${host}
`                 
                    break;
                    
                case 'trojan':
                     temp =
`- name: ${node_name}
  type: ${node_type}
  server: ${address}
  port: ${port}
  password: ${password}
  tls: ${security}
  udp: false
  sni: ${host}
  network: ${net_type}
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${host}
`                   
                    break;
                case 'hysteria2':
                    temp =
`- name: ${node_name}
  type: ${node_type}
  server: ${address}
  port: ${port}
  password: ${password}
  obfs: ${obfs}
  obfs-password: ${obs_password}
  tls: ${security}
  alpn:
    - h3
  sni: ${host}
  skip-cert-verify: true
  fast-open: true
`                      
                    break;
                case 'vmess':
                    temp =
`- name: ${node_name}
  type: ${node_type}
  server: ${address}
  port: ${port}
  uuid: ${password}
  alertId: 0
  cipher: ${encryption}
  udp: true
  tls: ${security}
  network: ${net_type}
  servername: ${host}
  ws-opts:
    path: "/?ed=2560"
    headers:
      Host: ${host}
`                    
                    break;
                case 'ss':
                    temp =
`- name: ${node_name}
  type: ${node_type}
  server: ${address}
  port: ${port}
  password: ${password}
  method: ${encryption}
  udp: true
`   
                    break;
                default:
                    temp = ``
                    break;
            }
            if(i < sum - 1)
            {
              groups_node = groups_node + `    - ${node_name}` + '\n';
              node_config = node_config + temp + '\n';
            }else{              
              groups_node = groups_node + `    - ${node_name}`;
              node_config = node_config + temp;
            }
            // console.log(port);
        }
    // console.log(groups_node);
    return`port: 7890
allow-lan: true
mode: rule
log-level: info
unified-delay: true
global-client-fingerprint: chrome
dns:
  enable: true
  listen: :53
  ipv6: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.1/16
  default-nameserver: 
    - 223.5.5.5
    - 114.114.114.114
    - 8.8.8.8
  nameserver:
    - https://dns.alidns.com/dns-query
    - https://doh.pub/dns-query
  fallback:
    - https://1.0.0.1/dns-query
    - tls://dns.google
  fallback-filter:
    geoip: true
    geoip-code: CN
    ipcidr:
      - 240.0.0.0/4

proxies:
${node_config}

proxy-groups:
- name: 负载均衡
  type: load-balance
  url: http://www.gstatic.com/generate_204
  interval: 300
  proxies:
${groups_node}

- name: 自动选择
  type: url-test
  url: http://www.gstatic.com/generate_204
  interval: 300
  tolerance: 50
  proxies:
${groups_node}

- name: 选择代理
  type: select
  proxies:
    - 负载均衡
    - 自动选择
    - DIRECT
${groups_node}

rules:
  - GEOIP,LAN,DIRECT
  - GEOIP,CN,DIRECT
  - MATCH,选择代理
  `
}
/**
 * @returns {string} 
 */
function singbox_config()
{
    let node_sb_name = ``;
    let node_sb_config = ``;
    let temp2 = ``;
    for(let m = 0; m < sum; m++)
    {
        get_config(m);
        switch(node_type)
        {
            case 'vless':
              temp2 = 
`        {
           "server": "${address}",
           "server_port": ${port},
           "tag": "${node_name}",
           "tls": {
           "enabled": ${security},
           "server_name": "${host}",
           "insecure": false,
           "utls": {
            "enabled": true,
            "fingerprint": "chrome"
              }           
           },
           "transport": {
           "headers": {
             "host": [
             "${host}"
             ]
           },
           "path": "/?ed=2560",
           "type": "${net_type}"          
           },
           "type": "vless",
           "uuid": "${password}"
        },`
              break;
            case 'trojan':
              temp2 = 
`        {
           "server": "${address}",
           "server_port": ${port},
           "tag": "${node_name}",
           "tls": {
           "enabled": ${security},
           "server_name": "${host}",
           "insecure": false,
           "utls": {
            "enabled": true,
            "fingerprint": "chrome"
              }           
           },
           "transport": {
           "headers": {
             "host": [
             "${host}"
             ]
           },
           "path": "/?ed=2560",
           "type": "${net_type}"        
           },
           "type": "trojan",
           "password": "${password}"
        },`
              break;
            case 'ss':
              temp2 = 
`        {
           "server": "${address}",
           "server_port": ${port},
           "tag": "${node_name}",
           "method": "${encryption}",
           "type": "shadowsocks",
           "password": "${password}"
        },`
              break;
            case 'hysteria2':
              temp2 = 
`        {
           "server": "${address}",
           "server_port": ${port},
           "tag": "${node_name}",
           "obfs": {
             "type": "${obfs}",
             "password": "${obs_password}"
           },
           "tls": {
           "enabled": ${security},
           "server_name": "${host}",
           "insecure": false,
           "utls": {
            "enabled": true,
            "fingerprint": "chrome"
              }           
           },
           "type": "hysteria2",
           "password": "${password}"
        },`
              break;
            case 'vmess':
              temp2 = 
`        {
           "server": "${address}",
           "server_port": ${port},
           "tag": "${node_name}",
           "security": "${encryption}",
           "tls": {
           "enabled": ${security},
           "server_name": "${host}",
           "insecure": false,
           "utls": {
            "enabled": true,
            "fingerprint": "chrome"
              }           
           },           
           "transport": {
           "headers": {
             "host": [
             "${host}"
             ]
           },
           "path": "/?ed=2560",
           "type": "${net_type}"      
           },
           "type": "vmess",
           "uuid": "${password}"
        },`
              break;
            default:
              temp2 = ``;
              break;          
        }
        if(m < sum -1)
        {
            node_sb_name = node_sb_name + `          "${node_name}",` + '\n';
            node_sb_config = node_sb_config + temp2 + '\n';
        }else{
          node_sb_name = node_sb_name + `          "${node_name}"`;
          node_sb_config = node_sb_config + temp2;
        }   
    }
return`{
      "log": {
      "disabled": false,
      "level": "info",
      "timestamp": true
      },
      "experimental": {
      "clash_api": {
        "external_controller": "127.0.0.1:9090",
        "external_ui": "ui",
        "external_ui_download_url": "",
        "external_ui_download_detour": "",
        "secret": "",
        "default_mode": "Rule"
      },
      "cache_file": {
        "enabled": true,
        "path": "cache.db",
        "store_fakeip": true
      }
      },
      "dns": {
      "servers": [
        {
        "tag": "proxydns",
        "address": "tls://8.8.8.8/dns-query",
        "detour": "select"
        },
        {
        "tag": "localdns",
        "address": "h3://223.5.5.5/dns-query",
        "detour": "direct"
        },
        {
        "address": "rcode://refused",
        "tag": "block"
        },
        {
        "tag": "dns_fakeip",
        "address": "fakeip"
        }
      ],
      "rules": [
        {
        "outbound": "any",
        "server": "localdns",
        "disable_cache": true
        },
        {
        "clash_mode": "Global",
        "server": "proxydns"
        },
        {
        "clash_mode": "Direct",
        "server": "localdns"
        },
        {
        "rule_set": "geosite-cn",
        "server": "localdns"
        },
        {
        "rule_set": "geosite-geolocation-!cn",
        "server": "proxydns"
         },
        {
        "rule_set": "geosite-geolocation-!cn",
        "query_type": [
          "A",
          "AAAA"
        ],
        "server": "dns_fakeip"
        }
      ],
      "fakeip": {
        "enabled": true,
        "inet4_range": "198.18.0.0/15",
        "inet6_range": "fc00::/18"
      },
      "independent_cache": true,
      "final": "proxydns"
      },   
      "inbounds": [
      {
        "type": "tun",
        "inet4_address": "172.19.0.1/30",
        "inet6_address": "fd00::1/126",
        "auto_route": true,
        "strict_route": true,
        "sniff": true,
        "sniff_override_destination": true,
        "domain_strategy": "prefer_ipv4"
      }
      ],
      "outbounds": [
        {
          "tag": "select",
          "type": "selector",
          "default": "auto",
          "outbounds": [
          "auto",
${node_sb_name}
          ]
        },
${node_sb_config}
        {
          "tag": "direct",
          "type": "direct"
        },
        {
          "tag": "block",
          "type": "block"
        },
        {
          "tag": "dns-out",
          "type": "dns"
        },
        {
          "tag": "auto",
          "type": "urltest",
          "outbounds": [
${node_sb_name}
          ],
        "url": "https://www.gstatic.com/generate_204",
        "interval": "1m",
        "tolerance": 50,
        "interrupt_exist_connections": false
      }
      ],
      "route": {
      "rule_set": [
        {
        "tag": "geosite-geolocation-!cn",
        "type": "remote",
        "format": "binary",
        "url": "https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/geolocation-!cn.srs",
        "download_detour": "select",
        "update_interval": "1d"
        },
        {
        "tag": "geosite-cn",
        "type": "remote",
        "format": "binary",
        "url": "https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geosite/geolocation-cn.srs",
        "download_detour": "select",
        "update_interval": "1d"
        },
        {
        "tag": "geoip-cn",
        "type": "remote",
        "format": "binary",
        "url": "https://cdn.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@sing/geo/geoip/cn.srs",
        "download_detour": "select",
        "update_interval": "1d"
        }
      ],
      "auto_detect_interface": true,
      "final": "select",
      "rules": [
        {
        "outbound": "dns-out",
        "protocol": "dns"
        },
        {
        "clash_mode": "Direct",
        "outbound": "direct"
        },
        {
        "clash_mode": "Global",
        "outbound": "select"
        },
        {
        "rule_set": "geoip-cn",
        "outbound": "direct"
        },
        {
        "rule_set": "geosite-cn",
        "outbound": "direct"
        },
        {
        "ip_is_private": true,
        "outbound": "direct"
        },
        {
        "rule_set": "geosite-geolocation-!cn",
        "outbound": "select"
        }
      ]
      },
      "ntp": {
      "enabled": true,
      "server": "time.apple.com",
      "server_port": 123,
      "interval": "30m",
      "detour": "direct"
      }
    }`;
}
