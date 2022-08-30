#!/usr/bin/python
# coding=utf-8
from hashlib import new
from itertools import count
import os
import re
import io

def get_filelist(dir,filetype):
    Filelist = []
    for home, dirs, files in os.walk(dir):
        for filename in files:
            if(filename[-len(filetype):]==filetype):
                Filelist.append(os.path.join(home, filename))
    return Filelist

data=[
    ['角色','角色','Role'],
    ['超级管理员','超級管理員','super administrator'],
    ['审核员','審核員','auditor'],
    ['开户员','開戶員','Account opener'],
    ['发送员','發送員','sender'],
    ['客服员','客服員','customer service'],
    ['尾号','尾號','tail number'],
    ['监控中心全选','監控中心全選','Monitoring Center Select All'],
    ['监控大屏','監控大屏','Monitor the big screen'],
    ['实时监控警报','實時監控警報','Monitor alerts in real time'],
    ['批量处理','批量處理','batch processing'],
    ['历史监控警报','歷史監控警報','Historical monitoring alerts'],
    ['监控详情','監控詳情','Monitoring details'],
    ['主机监控详情','主機監控詳情','Host monitoring details'],
    ['程序监控详情','程序監控詳情','Program monitoring details'],
    ['数据库监控详情','數據庫監控詳情','Database monitoring details'],
    ['消息延迟监控详情','消息延遲監控詳情','Message Latency Monitoring Details'],
    ['业务量监控详情','業務量監控詳情','Business volume monitoring details'],
    ['监控设置','監控設置','Monitoring settings'],
    ['主机监控设置','主機監控設置','Host monitoring settings'],
    ['批量设置','批量設置','Batch settings'],
    ['程序监控设置','程序監控設置','Program monitoring settings'],
    ['接入账号监控设置','接入賬號監控設置','Access account monitoring settings'],
    ['设置指标','設置指標','set indicator'],
    ['平台监控设置','平台監控設置','Platform monitoring settings'],
    ['数据库监控设置','數據庫監控設置','Database monitoring settings'],
    ['通道监控设置','通道監控設置','Channel monitoring settings'],
    ['消息延迟监控设置','消息延遲監控設置','Message Latency Monitoring Settings'],
    ['网络监控设置','網絡監控設置','Network monitoring settings'],
    ['通信管理全选','通信管理全選','Communication Management Select All'],
    ['基础设置','基礎設置','Basic Settings'],
    ['运营商号段管理','運營商號段管理','Operator number segment management'],
    ['区域号段管理','區域號段管理','Area number segment management'],
    ['SP账号充值/回收','SP賬號充值/回收','SP account recharge/recovery'],
    ['批量','批量','batch'],
    ['操作员管理','操作員管理','Operator management'],
    ['初始化密码','初始化密碼','initialization password'],
    ['机构管理','機構管理','Institutional management'],
    ['文件导出','文件導出','file export'],
    ['角色管理','角色管理','role management'],
    ['业务类型管理','業務類型管理','Business type management'],
    ['模块参数配置','模塊參數配置','Module parameter configuration'],
    ['全局参数配置','全局參數配置','Global parameter configuration'],
    ['审核参数配置','審核參數配置','Audit parameter configuration'],
    ['高级安全设置','高級安全設置','Advanced Security Settings'],
    ['自定义参数管理','自定義參數管理','Custom parameter management'],
    ['新增参数定义','新增參數定義','Add parameter definition'],
    ['修改参数定义','修改參數定義','Modify parameter definitions'],
    ['修改参数值','修改參數值','Modify parameter value'],
    ['删除参数值','刪除參數值','delete parameter value'],
    ['新增参数值','新增參數值','Add parameter value'],
    ['操作日志','操作日誌','Operation log'],
    ['个性化界面设置','個性化界面設置','Personalized interface settings'],
    ['公告列表','公告列表','Announcement list'],
    ['员工机构','員工機構','staff organization'],
    ['查看日志','查看日誌','View logs'],
    ['批量充值','批量充值','Bulk recharge'],
    ['限额设置','限額設置','Limit setting'],
    ['余额（条）','餘額（條）','Balance (bar)'],
    ['限额（条/每月）','限額（條/每月）','Limit (articles/month)'],
    ['告警阈值','告警閾值','Alarm threshold'],
    ['通知人','通知人','alert others'],
    ['充值','充值','recharge'],
    ['回收','回收','Recycle'],
    ['阈值','閾值','threshold'],
    ['供x条','供x條','for x'],
    ['充入机构','充入機構','charging agency'],
    ['充值员','充值員','recharger'],
    ['执行结果','執行結果','Results of the'],
    ['全部、成功、失败','全部、成功、失敗','all, success, failure'],
    ['操作时间','操作時間','Operation time'],
    ['确认','確認','confirm'],
    ['有','有','Have'],
    ['注销','註銷','log out'],
    ['锁定','鎖定','locking'],
    ['开户人','開戶人','Account holder'],
    ['操作员编码','操作員編碼','operator code'],
    ['数据权限','數據權限','data permission'],
    ['员工基本信息','員工基本信息','Basic information of employees'],
    ['职位','職位','Position'],
    ['分配角色','分配角色','Assigning Roles'],
    ['账号状态','賬號狀態','Account status'],
    ['设置审核流程','設置審核流程','Set up the review process'],
    ['必审','必審','Compulsory trial'],
    ['免审','免審','exempt from trial'],
    ['固定尾号','固定尾號','fixed tail number'],
    ['是否接收审核提醒','是否接收審核提醒','Whether to receive review reminders'],
    ['是否为客服人员','是否為客服人員','Whether it is a customer service staff'],
    ['操作员数据权限','操作員數據權限','Operator Data Permissions'],
    ['个人','個人','personal'],
    ['机构审核员','機構審核員','Institutional Auditor'],
    ['客户通讯录权限','客戶通訊錄權限','Customer address book permissions'],
    ['充值回收权限','充值回收權限','Recharge and recovery authority'],
    ['下行内容查看权限','下行內容查看權限','Downstream content viewing permission'],
    ['全部可见','全部可見','all visible'],
    ['数字不可见','數字不可見','numbers are not visible'],
    ['联系方式','聯繫方式','Contact information'],
    ['传真','傳真','fax'],
    ['请选择机构','請選擇機構','Please select an institution'],
    ['下载模板','下載模板','Download template'],
    ['导入记录','導入記錄','Import records'],
    ['成功数','成功數','Number of successes'],
    ['选择文件','選擇文件','Select the file'],
    ['机构职责','機構職責','Institutional Responsibilities'],
    ['统一消息','統一消息','Unified Messaging'],
    ['业务场景管理','業務場景管理','Business Scenario Management'],
    ['数据查看','數據查看','Data view'],
    ['上行记录查看','上行記錄查看','Upstream record view'],
    ['个人收件箱','個人收件箱','Personal inbox'],
    ['发送明细导出','發送明細導出','Send details export'],
    ['业务场景发送记录','業務場景發送記錄','Business scenario sending records'],
    ['场景渠道发送记录','場景渠道發送記錄','Scenario channel sending record'],
    ['欠费滞留记录','欠費滯留記錄','Detention records for arrears'],
    ['短链批次访问统计','短鏈批次訪問統計','Short-chain batch access statistics'],
    ['详情-导出','詳情-導出','Details - Export'],
    ['短链用户访问明细','短鏈用戶訪問明細','Short-chain user access details'],
    ['新建关键词','新建關鍵詞','new keyword'],
    ['模板管理','模板管理','Template management'],
    ['新建素材','新建素材','New material'],
    ['修改素材','修改素材','Modify material'],
    ['删除素材','刪除素材','delete material'],
    ['启用禁用','啟用禁用','enable disable'],
    ['启用/禁用','啟用/禁用','enable/disable'],
    ['统计分析','統計分析','Statistical Analysis'],
    ['查看导出','查看導出','view export'],
    ['数据分析','數據分析','data analysis'],
    ['总体发送趋势','總體發送趨勢','Overall sending trends'],
    ['区域发送对比','區域發送對比','Regional sending comparison'],
    ['SP帐号发送对比','SP帳號發送對比','SP account sending comparison'],
    ['业务类型发送对比','業務類型發送對比','Business type sending comparison'],
    ['客户列表','客戶列表','Customer List'],
    ['微信粉丝列表','微信粉絲列表','WeChat fans list'],
    ['客户群组管理','客戶群組管理','Customer group management'],
    ['新建群组','新建群組','New group'],
    ['删除群组','刪除群組','delete group'],
    ['重命名','重命名','Rename'],
    ['添加成员','添加成員','Add members'],
    ['移除成员','移除成員','remove member'],
    ['微信群组管理','微信群組管理','WeChat group management'],
    ['属性管理','屬性管理','Property management'],
    ['修改属性','修改屬性','Modify properties'],
    ['删除属性','刪除屬性','delete attribute'],
    ['客户扩展属性','客戶擴展屬性','Client Extended Properties'],
    ['权限管理','權限管理','authority management'],
    ['长链接管理','長鏈接管理','Long link management'],
    ['动态短链生成状态','動態短鏈生成狀態','Dynamic short chain generation status'],
    ['失败补发','失敗補發','Failed to reissue'],
    ['短域名管理','短域名管理','Short domain name management'],
    ['发送审核','發送審核','Send for review'],
    ['模板审核','模板審核','Template review'],
    ['业务场景审核','業務場景審核','Business Scenario Review'],
    ['审核流程管理','審核流程管理','Review process management'],
    ['审核配置','審核配置','Audit configuration'],
    ['业务名称','業務名稱','business name'],
    ['业务编码','業務編碼','business code'],
    ['优先级','優先級','priority'],
    ['无优先级','無優先級','no priority'],
    ['界面发送+接口发送','界面發送+接口發送','Interface send + interface send'],
    ['界面发送','界面發送','interface send'],
    ['接口发送','接口發送','interface send'],
    ['操作员','操作員','operator'],
    ['发送优先级','發送優先級','Send priority'],
    ['业务描述','業務描述','business description'],
    ['新建业务类型','新建業務類型','New business type'],
    ['优先级别','優先級別','priority'],
    ['请选择优先级','請選擇優先級','Please select a priority'],
    ['密码安全设置','密碼安全設置','Password security settings'],
    ['位数要求','位數要求','Number of digits required'],
    ['位以上','位以上','above'],
    ['组合形式','組合形式','Combination'],
    ['至少包括','至少包括','include at least'],
    ['数字','數字','number'],
    ['字母','字母','letter'],
    ['符号','符號','symbol'],
    ['修改周期','修改週期','modification cycle'],
    ['过期提醒','過期提醒','Expiration reminder'],
    ['错误上限','錯誤上限','error cap'],
    ['次','次','Second-rate'],
    ['配置成功!','配置成功!','Configuration successful!'],
    ['审核全局配置','審核全局配置','Audit global configuration'],
    ['审核开关','審核開關','Audit switch'],
    ['APP模板','APP模板','APP template'],
    ['长链审核','長鏈審核','long chain audit'],
    ['微信模板','微信模板','WeChat template'],
    ['邮箱账号','郵箱賬號','email address'],
    ['邮箱验证','郵箱驗證','E-mail verification'],
    ['发送协议','發送協議','Send agreement'],
    ['邮件服务器','郵件服務器','Mail Server'],
    ['服务器端口','服務器端口','server port'],
    ['全局贴尾','全局貼尾','global sticker'],
    ['全局贴尾模板','全局貼尾模板','Global sticker template'],
    ['回复TD退订','回复TD退訂','Reply TD unsubscribe'],
    ['其他贴尾类型','其他貼尾類型','Other sticker types'],
    ['业务贴尾','業務貼尾','business stickers'],
    ['SP贴尾','SP貼尾','SP sticker'],
    ['拓展尾号位数','拓展尾號位數','Extended trailing digits'],
    ['机构计费开关','機構計費開關','Institutional Billing Switch'],
    ['页面数据脱敏','頁面數據脫敏','Page data desensitization'],
    ['上行指令加黑名单','上行指令加黑名單','Upstream command plus blacklist'],
    ['手机动态口令模板','手機動態口令模板','Mobile phone dynamic password template'],
    ['模板可编辑','模板可編輯','Template editable'],
    ['绑定IP','綁定IP','bind IP'],
    ['启用动态口令','啟用動態口令','Enable dynamic password'],
    ['解除绑定','解除綁定','unbind'],
    ['IP地址','IP地址','IP address'],
    ['IP地址状态','IP地址狀態','IP address status'],
    ['已绑定','已綁定','bound'],
    ['未绑定','未綁定','unbound'],
    ['动态口令状态','動態口令狀態','Dynamic Password Status'],
    ['未启用','未啟用','Not activated'],
    ['文件导入绑定','文件導入綁定','file import binding'],
    ['IP地址绑定-添加','IP地址綁定-添加','IP address binding - add'],
    ['添加栏','添加欄','add column'],
    ['解除IP地址绑定','解除IP地址綁定','Unbind IP address'],
    ['解除动态口令','解除動態口令','Unlock dynamic password'],
    ['参数项','參數項','parameter item'],
    ['分段数','分段數','number of segments'],
    ['分段符','分段符','paragraph break'],
    ['上传/下载','上傳/下載','Upload Download'],
    ['业务修改','業務修改','business modification'],
    ['业务删除','業務刪除','business deletion'],
    ['业务发送','業務發送','business sending'],
    ['业务新增','業務新增','new business'],
    ['业务新增/修改','業務新增/修改','Business addition/modification'],
    ['业务查询/统计','業務查詢/統計','Business Inquiries/Statistics'],
    ['系统修改','系統修改','system modification'],
    ['系统充值/回收','系統充值/回收','System recharge/recovery'],
    ['系统删除','系統刪除','system delete'],
    ['系统启用/禁用','系統啟用/禁用','System enable/disable'],
    ['系统审核','系統審核','system audit'],
    ['系统新增','系統新增','System added'],
    ['系统新增/修改','系統新增/修改','System additions/modifications'],
    ['系统查询/统计','系統查詢/統計','System query/statistics'],
    ['系统登入/登出','系統登入/登出','System login/logout'],
    ['日志类型','日誌類型','log type'],
    ['业务日志','業務日誌','business log'],
    ['系统日志','系統日誌','System log'],
    ['严重等级','嚴重等級','Severity level'],
    ['登录界面设置','登錄界面設置','Login interface settings'],
    ['LOGO图片','LOGO圖片','Logo image'],
    ['帮助手册','幫助手冊','Help Manual'],
    ['恢复默认','恢復默認','reset'],
    ['发布公告','發布公告','announce'],
    ['通知对象','通知對象','notify object'],
    ['全局广播','全局廣播','Global broadcast'],
    ['按角色','按角色','According to the character'],
    ['要用英文描述操作内容','要用英文描述操作內容','To describe the operation content in English'],
    ['新建网关动态参数定义','新建網關動態參數定義','New gateway dynamic parameter definition'],
    ['参数名称不能为空','參數名稱不能為空','Parameter name cannot be empty'],
    ['确定启用动态口令？','確定啟用動態口令？','Are you sure you enable dynamic passwords?'],
    ['企业邮箱配置密码不能为空！','企業郵箱配置密碼不能為空！','The enterprise mailbox configuration password cannot be empty!'],
    ['邮箱格式不正确','郵箱格式不正確','E-mail format is incorrect'],
]
def createKey(data): 
    keyArr=[]
    for item in data:
        enVal=item[2]
        arr=enVal.title().split(' ')
        newArr=[]
        for arrItem in arr:
            if len(arr)==1:#1个单词
                if len(arrItem)>20:
                    arrItem=arrItem[0:20]
            elif len(arr)==2:#2个单词
                if len(arrItem)>8:
                    arrItem=arrItem[0:5]
                elif len(arrItem)>15:
                    arrItem=arrItem[0:8]
            elif len(arr)<5&len(arr)>=3:#3、4个单词
                if len(arrItem)>6:
                    arrItem=arrItem[0:4] 
            elif len(arr)<8&len(arr)>=6:#6、7个单词
                if len(arrItem)>4:
                    arrItem=arrItem[0:3]  
            else:
                if len(arrItem)>3:
                    arrItem=arrItem[0:3]
            newArr.append(arrItem)   
        enVal=''.join(newArr)
        if len(enVal)>20:
            enVal=enVal[0:20]
        regex=re.compile('[^A-Za-z]')
        key=re.sub(regex,'',enVal)
        keyArr.append(key)
        count=0
        count=keyArr.count(key)
        if count>1: 
            key=key+str(count)
        item.insert(0,key)
        print(key)
    
    return data
        # print(' \''+key+'\': \''+item[0]+'\': \''+item[1]+'\': \''+enVal+'\' ')
 
# 写到文件中
def listWriteFile(file_name,langData,index): 
    with io.open(file_name,"w",encoding="utf-8") as f: 
        for val in langData: 
            f.write('\''+val[0]+'\': ') 
            f.write('\''+val[index]+'\', ')      
            f.write('\n')

def createLangJs(langData):
    dir="D:\\任务\\UMC\\20220801国际化多语言项目\\"#文件创建到哪个文件夹
    fileParams=[
        [dir+'zh.js',1],
        [dir+'zhCHT.js',2],
        [dir+'en.js',3],
    ]
    for file in fileParams: 
        listWriteFile(file[0],langData,file[1]) 

#程序入口
if __name__ =="__main__": 
    langData=createKey(data)
    createLangJs(langData)