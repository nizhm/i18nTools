#!/usr/bin/python
# coding=utf-8

import os
import re
import io
import demjson #所安装的Python的Scripts目录下进入cmd界面,首先pip install  setuptools==57.5.0，然后pip install demjson
# 通讯录
contcat=[
    ['Aurora', '极光'],
    ['ANTGROUP', '蚂蚁'],
    ['GeTui', '个推'],
    ['Copy', '复制'],
]

def get_filelist(dir,filetype):
    Filelist = []
    for home, dirs, files in os.walk(dir):
        for filename in files:
            if(filename[-len(filetype):]==filetype):
                Filelist.append(os.path.join(home, filename))    
    if Filelist==[]:
        Filelist=[dir]
    return Filelist

# ReadOldObj:获取旧的项目的地址
def getObjUrl(moduleName,dir):
    fileList=[]
    # file_type=[".vue",".js"]
    file_type=[".vue"]
    for type in file_type:
        print("开始处理"+type+"类型文件")
        file_list = get_filelist(dir,type) 
        for file in file_list:
            with io.open(file, "r", encoding="utf-8") as f:
                t=f.read()
                if t.find('$t(\''+moduleName)!=-1 or t.find('tc(\''+moduleName)!=-1:
                    isStyle=False
                    if t.find('styleIsFlag')!=-1:
                        isStyle=True
                    item=[file,isStyle]
                    fileList.append(item)
    return fileList

#Lang：获取Lang语言对象
def getDictObj(t): 
    #处理格式，转为字典
    t=t.replace('module.exports = ','')
    dictObj=demjson.decode(t)
    return dictObj

#Lang：获取Lang语言对象
def getListObj(obj):
    list=[]
    for key,val in obj.items():
        item=getKeyVal(key,val)
        list.extend(item) 
    # print("结果 list:",list)
    return list

#Lang：获取Lang语言对象
def getKeyVal(key,val):
    list=[]
    if type(val)==str:
        item=[key,val] 
        list.append(item)
        return list
    elif type(val)==dict: 
        for key2,val2 in val.items():
            item=getKeyVal(key+"."+key2,val2)
            list.extend(item)
        return list

#Lang：获取Lang语言对象
def getTempList(file_name):
    with io.open(file_name, "r", encoding="utf-8") as f: 
        t=f.read()
        dictObj=getDictObj(t)
        list=getListObj(dictObj) 
        # for objItem in list:
        #     print("zh：【"+objItem[1]+"】   key：【"+objItem[0]+"】")
        return list

#1 JS文件
def replace_JS(obj,dir):
    #要改的文件类型（可以输入多个）
    file_type=[".js"]
    #替换表
    look_up_table=obj
    for type in file_type:
        print("开始处理"+type+"类型文件")
        file_list = get_filelist(dir,type) 
        for file in file_list: 
            file_data=""
            with io.open(file, "r", encoding="utf-8") as f:
                t=f.read()
                for item in look_up_table:
                    # #JS文件
                    t=replaceJSfile(t,item[1],item[0])
                file_data=t
            with io.open(file,"w",encoding="utf-8") as f:
                f.write(file_data)
    print("结束处理"+type+"类型文件")

#1.1 JS文件
def replaceJSfile(str,zh,key):
    obj=[
        ["'"+zh+"'", "i18n.tc('"+key+"')"],#'姓名'
    ]
    for objItem in obj:
        str=str.replace(objItem[0],objItem[1]) 
        print("replaceJSfile oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    
    importStr='import { i18n } from "@/main"'
    if str.find('i18n')!=-1&str.find(importStr)==-1:
        if(str.find('<script>')!=-1):
            str=str.replace('<script>'+'\n','')
            importStr='<script>'+'\n'+importStr
        str=importStr+'\n'+str
    return str

#2 VUE文件
def replace_Vue(obj,dir):
    #要改的文件类型（可以输入多个）
    file_type=[".vue"]
    #替换表
    look_up_table=obj
    for type in file_type:
        print("开始处理"+type+"类型文件")
        file_list = get_filelist(dir,type)
        for file in  file_list:
            file_data=""
            with io.open(file, "r", encoding="utf-8") as f:
                t=f.read()
                file_data=replace_VueText(t,look_up_table)
            with io.open(file,"w",encoding="utf-8") as f:
                f.write(file_data)
    print("结束处理"+type+"类型文件") 

#2.0
def replace_VueText(str,look_up_table):
    htmlStr=str[str.find('<template>'):str.find('<script>')]
    htmlStrOld=htmlStr

    vueJsStr=str[str.find('<script>'):str.find('</script>')]
    vueJsStrOld=vueJsStr

    for item in look_up_table:
        #替换HTML部分       
        htmlStr=replaceHTML(htmlStr,item[1],item[0])
        #替换Script部分
        vueJsStr=replaceVUEJS(vueJsStr,item[1],item[0]) 
        if item[1].find('！'):
            htmlStr=replaceHTML(htmlStr,item[1].replace('！','!'),item[0])
            vueJsStr=replaceVUEJS(vueJsStr,item[1].replace('！','!'),item[0])
    str=str.replace(htmlStrOld,htmlStr)
    str=str.replace(vueJsStrOld,vueJsStr) 
    return str

#2.1 HMl
def replaceHTML(str,zh,key):
    if key.find('{0}')==-1:
        #格式纠正
        str=replaceFormatPer1(str,zh,key) 

        #html 日期相关 Label替换标签相关
        str=replaceFormat_htmlLabel_Date(str,zh,key)    
        #htmlLabel替换标签相关    
        str=replaceFormat_htmlLabel(str,zh,key)

        #htmlText
        str=replaceFormat_htmlText(str,zh,key)

        #htmlScript
        str=replaceFormat_htmlScript(str,zh,key)
    return str

#2.2 VUEJS
def replaceVUEJS(str,zh,key):
    if key.find('{0}')==-1:
        #script
        str=replaceFormat_VUEScript(str,zh,key)
    return str
 
#格式纠正
def replaceFormatPer1(str,zh,key): 
    obj=[
        ['： "','："'],
        [': "',':"'],
    ]
    for objItem in obj:
        str=str.replace(objItem[0],objItem[1]) 
        print("replaceFormatPer1 oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    return str

#html 日期相关 Label替换标签相关
def replaceFormat_htmlLabel_Date(str,zh,key):
    #日期组件可能会存在的情况
    dateLabelList=['至','开始日期','开始时间','结束日期','结束时间'] 
    #少数日期组件替换
    for dateItem in dateLabelList:
        #当符合列表内容时才会替换
        if dateItem==zh:
            attr=[ 
                'range-separator',
                'start-placeholder',
                'end-placeholder', 
            ]    
            for attrItem in attr:
                obj=[
                    [attrItem+'="'+zh+'"' , ':'+attrItem+'="$t('+"'"+key+"'"+')"'],
                    # [attrItem+'="'+zh+'："' , ':'+attrItem+'="$t('+"'"+key+"'"+')+`：`"'],
                    # [attrItem+'="'+zh+':"' , ':'+attrItem+'="$t('+"'"+key+"'"+')+`:`"'],
                ]
                for objItem in obj:
                    str=str.replace(objItem[0],objItem[1]) 
                    print("replaceFormat_htmlLabel_Date oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    return str

#htmlLabel替换标签相关
def replaceFormat_htmlLabel(str,zh,key):
    attr=[
        'label',
        'title',
        'element-loading-text',
        'placeholder'
    ]    
    for attrItem in attr:
        obj=[
            [attrItem+'="'+zh+'"' , ':'+attrItem+'="$t('+"'"+key+"'"+')"'],
            [attrItem+'="'+zh+'："' , ':'+attrItem+'="$t('+"'"+key+"'"+')+`：`"'],
            [attrItem+'="'+zh+':"' , ':'+attrItem+'="$t('+"'"+key+"'"+')+`:`"'],
        ]
        for objItem in obj:
            str=str.replace(objItem[0],objItem[1]) 
            print("replaceFormat_htmlLabel oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    return str

#htmlText  
def replaceFormat_htmlText(str,zh,key):
    obj=[
        ['>'+zh+'<', ">{{ $t('"+key+"') }}<"],#<span>确定</span>
        ['>'+zh+'：<',">{{ $t('"+key+"') }}：<"], #<span>确定：</span>
        ['>*'+zh+'<', ">*{{ $t('"+key+"') }}<"],#<p style="color: red">*请选择需要修改的群组</p>
    ]

    for objItem in obj:
        str=str.replace(objItem[0],objItem[1]) 
        print("replaceFormat_htmlText oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    return str 
    
#htmlScript 
def replaceFormat_htmlScript(str,zh,key):
    obj=[
        ["`"+zh+"`", "$t('"+key+"')"], #: '确定'
        ["'"+zh+"：'", "$t('"+key+"')+`：`"],#'确定：'
        ['"'+zh+'："', "$t('"+key+"')+`：`"],#"确定："
        ["'"+zh+":'", "$t('"+key+"')+`:`"],#'确定:'
        ['"'+zh+':"', "$t('"+key+"')+`:`"],#"确定:" 
        ["'"+zh+"'", "$t('"+key+"')"], #'确定'
        # ['"'+zh+'"', "$t('"+key+"')"], #"确定"
    ]

    for objItem in obj:
        str=str.replace(objItem[0],objItem[1]) 
        print("replaceFormat_htmlScript oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    return str

#VUEScript 
def replaceFormat_VUEScript(str,zh,key):
    obj=[ 
        ["`"+zh+"`", "i18n.tc('"+key+"')"], #: `确定`
        ["'"+zh+"：'", "i18n.tc('"+key+"')+`：`"],#'确定：'
        ["'"+zh+":'", "i18n.tc('"+key+"')+`:`"],#'确定：'
        ['"'+zh+'："', "i18n.tc('"+key+"')+`：`"],#"确定："
        ['"'+zh+':"', "i18n.tc('"+key+"')+`:`"],#"确定:" 
        ["'"+zh+"'", "i18n.tc('"+key+"')"], #'确定'
        ['"'+zh+'"', "i18n.tc('"+key+"')"], #"确定"
    ]

    for objItem in obj:
        str=str.replace(objItem[0],objItem[1]) 
        print("replaceFormat3 oldStr：【"+objItem[0]+"】   newStr：【"+objItem[1]+"】")
    
    importStr='import { i18n } from "@/main"'
    if str.find('i18n')!=-1&str.find(importStr)==-1:
        if(str.find('<script>')!=-1):
            str=str.replace('<script>'+'\n','')
            importStr='<script>'+'\n'+importStr
        str=importStr+'\n'+str
    return str
 
#1 替换数据
def replaceData(obj,dir):
    replace_Vue(obj,dir)
    replace_JS(obj,dir) 


# ReadOldObj:获取新的项目 需要做多语言的 地址
def getNewReplaceDirList():
    newList=[]
    list=getReplaceDirList()
    for item in list:
        newList.append(item[2])
    return newList

# ReadOldObj:获取地址
def getReplaceDirList():
    oldObjDir='D:\\UMCgit\\guojihua\\umc-web\\'# 旧的项目文件夹
    newObjDir='D:\\UMCgit\\312\\umc-web\\'# 新的项目文件夹
    dir='src\\components\\BaseChart'# 子文件夹 dir=''
    moduleName='statistics.' # 指定模块【会查询是否有'$t(\''+moduleName 或 'tc(\''+moduleName】 moduleName=''    
    dirList=getObjUrl(moduleName,oldObjDir+dir)# 获取旧的项目 做过相关多语言的 地址
    for item in dirList:
        item.append(item[0].replace(oldObjDir,newObjDir))
    return dirList

def replaceText():
    langFileList=[
        "D:\\UMCgit\\312\\umc-web\\src\\lang\\zh.js",#公共
        "D:\\UMCgit\\312\\umc-web\\src\\lang\\statistics\\zh.js"#统计分析
    ]
    # 指定要替换的文件夹及文件
    # newReplaceDirList=[
    #     "D:\\UMCgit\\312\\umc-web\\src\\views\\statistics\\form",
    #     "D:\\UMCgit\\312\\umc-web\\src\\views\\statistics\\analysis",
    #     "D:\\UMCgit\\312\\umc-web\\src\\views\\fg\\statistics",
    # ] 

    # 通过读取旧的项目，获取要替换的文件夹及文件
    newReplaceDirList=getNewReplaceDirList()# 获取新的项目 需要做多语言的 地址
    # print('newReplaceDirList:',newReplaceDirList)

    for dirItem in newReplaceDirList:
        for langItem in langFileList:
            moduleKey=getTempList(langItem)
            replaceData(moduleKey,dirItem) # 替换


#程序入口
if __name__ =="__main__": 
    replaceText()


print("全部结束")