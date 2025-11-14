const services = {
    "domestic": {
        name: "国内邮件",
        types: {
            "letter": { name: "信函", weightRequired: true, maxWeight: 2000, addons: ["register", "receipt", "insured"] },
            "printed": { name: "印刷品", weightRequired: true, maxWeight: 5000, addons: ["register", "receipt", "insured"] },
            "postcard": { name: "明信片", weightRequired: false, maxWeight: 20, addons: ["register", "receipt"] }
        }
    },
    "hkmotw": {
        name: "港澳台邮件",
        types: {
            "letter": { name: "信函", weightRequired: true, maxWeight: 2000, addons: ["register", "receipt", "insured"] },
            "printed": { name: "印刷品", weightRequired: true, maxWeight: 5000, addons: ["register", "receipt", "insured"] },
            "postcard": { name: "明信片", weightRequired: false, maxWeight: 20, addons: ["register", "receipt"] },
            "small_packet": { name: "小包", weightRequired: true, maxWeight: 2000, addons: ["register", "insured"] },
            "aerogramme": { name: "航空邮简", weightRequired: false, maxWeight: 10 }
        }
    },
    "international": {
        name: "国际邮件",
        transportModes: { "air": "航空", "sal": "空运水陆路 (SAL)", "surface": "水陆路" },
        types: {
            "letter": { name: "信函", weightRequired: true, maxWeight: 2000, addons: ["register", "receipt", "insured"] },
            "printed": { name: "印刷品", weightRequired: true, maxWeight: 5000, addons: ["register", "receipt", "insured"] },
            "postcard": { name: "明信片", weightRequired: false, maxWeight: 20, addons: ["register", "receipt"] },
            "small_packet": { name: "小包", weightRequired: true, maxWeight: 2000, addons: ["register", "insured"] },
            "aerogramme": { name: "航空邮简", weightRequired: false, maxWeight: 10, transport: ["air"] }
        }
    }
};

const addons = {
    "register": { name: "挂号", conflicts: [] },
    "receipt": { name: "回执", conflicts: [], depends: "register" }, // 回执必须依赖挂号
    "insured": { name: "保价", conflicts: [] }
};

// 国际分组（已补全所有说明，拒绝偷懒！）
const intlGroups = {
    air: { // 航空
        letter: {
            "1": { name: "第1组", note: "朝鲜、蒙古、越南、日本、韩国、哈萨克斯坦、吉尔吉斯斯坦、塔吉克斯坦、乌兹别克斯坦、土库曼斯坦" },
            "2": { name: "第2组", note: "其他亚洲国家或地区" },
            "3": { name: "第3组", note: "欧洲各国或地区、美国、加拿大、澳大利亚、新西兰" },
            "4": { name: "第4组", note: "美洲其他国家或地区、非洲各国或地区、太平洋岛屿" }
        },
        printed: {
            "1": { name: "第1组", note: "阿联酋、阿曼、巴基斯坦、巴林、菲律宾、格鲁吉亚、柬埔寨、卡塔尔、科威特、老挝、马尔代夫、马来西亚、孟加拉国、缅甸、尼泊尔、斯里兰卡、泰国、文莱、新加坡、印度、印度尼西亚" },
            "2": { name: "第2组", note: "阿塞拜疆、朝鲜、哈萨克斯坦、韩国、吉尔吉斯斯坦、蒙古国、日本、塔吉克斯坦、土耳其、土库曼斯坦、乌兹别克斯坦、伊拉克、约旦、越南、阿尔巴尼亚、爱尔兰、爱沙尼亚、奥地利、白俄罗斯、保加利亚、比利时、冰岛、波兰、丹麦、德国、法国、芬兰、荷兰、捷克、克罗地亚、拉脱维亚、立陶宛、卢森堡、罗马尼亚、马耳他、摩尔多瓦、挪威、葡萄牙、瑞典、塞尔维亚、斯洛伐克、斯洛文尼亚、乌克兰、西班牙、希腊、匈牙利、意大利、英国、加拿大、美国、澳大利亚、新西兰" },
            "3": { name: "第3组", note: "其他国家和地区" }
        },
        small_packet: {
            "1": { name: "第1组", note: "阿联酋、阿曼、巴基斯坦、巴林、菲律宾、格鲁吉亚、柬埔寨、卡塔尔、科威特、老挝、马尔代夫、马来西亚、孟加拉国、缅甸、尼泊尔、斯里兰卡、泰国、文莱、新加坡、印度、印度尼西亚" },
            "2": { name: "第2组", note: "阿塞拜疆、朝鲜、哈萨克斯坦、韩国、吉尔吉斯斯坦、蒙古国、日本、塔吉克斯坦、土耳其、土库曼斯坦、乌兹别克斯坦、伊拉克、约旦、越南、阿尔巴尼亚、爱尔兰、爱沙尼亚、奥地利、白俄罗斯、保加利亚、比利时、冰岛、波兰、丹麦、德国、法国、芬兰、荷兰、捷克、克罗地亚、拉脱维亚、立陶宛、卢森堡、罗马尼亚、马耳他、摩尔多瓦、挪威、葡萄牙、瑞典、塞尔维亚、斯洛伐克、斯洛文尼亚、乌克兰、西班牙、希腊、匈牙利、意大利、英国、加拿大、美国、澳大利亚、新西兰" },
            "3": { name: "第3组", note: "其他国家和地区" }
        }
    },
    sal: { // 空运水陆路
        letter: {
            "1": { name: "第1组", note: "韩国、日本" },
            "2": { name: "第2组", note: "塞浦路斯" },
            "3": { name: "第3组", note: "亚美尼亚、阿塞拜疆、格鲁吉亚、阿尔巴尼亚、德国、安道尔、奥地利、白俄罗斯、比利时、波黑、保加利亚、克罗地亚、丹麦、西班牙、爱沙尼亚、法罗群岛、芬兰、法国、直布罗陀、英国、希腊、匈牙利、爱尔兰、冰岛、意大利、拉脱维亚、列支敦士登、立陶宛、卢森堡、北马其顿、马耳他、摩尔多瓦、摩纳哥、挪威、荷兰、波兰、葡萄牙、圣马力诺、罗马尼亚、俄罗斯、斯洛伐克、斯洛文尼亚、瑞典、瑞士、捷克、乌克兰、梵蒂冈、塞尔维亚、黑山、美国、加拿大、澳大利亚" },
            "4": { name: "第4组", note: "科摩罗、亚速尔群岛和马德拉群岛(葡)、莱索托、圣多美和普林西比、安圭拉岛(英)、阿松森岛、玻利维亚、巴西、格陵兰、百慕大、圣皮埃尔和密克隆、特里斯坦-达库尼亚群岛、美属维尔京群岛、巴拉圭、波多黎各" }
        },
        printed: {
            "1": { name: "第1组", note: "格鲁吉亚" },
            "2": { name: "第2组", note: "阿塞拜疆、韩国、日本、阿尔巴尼亚、爱尔兰、爱沙尼亚、奥地利、白俄罗斯、保加利亚、比利时、冰岛、波兰、丹麦、德国、法国、芬兰、荷兰、捷克、克罗地亚、拉脱维亚、立陶宛、卢森堡、罗马尼亚、马耳他、摩尔多瓦、挪威、葡萄牙、瑞典、塞尔维亚、斯洛伐克、斯洛文尼亚、乌克兰、西班牙、希腊、匈牙利、意大利、英国、加拿大、美国、澳大利亚" },
            "3": { name: "第3组", note: "俄罗斯、科摩罗、圣多美和普林西比、莱索托、安圭拉岛(英)、巴拉圭、巴西、百慕大、波多黎各、玻利维亚、格陵兰、美属维尔京群岛、圣皮埃尔和密克隆、安道尔、波黑、法罗群岛、梵蒂冈、黑山、列支敦士登、北马其顿、摩纳哥、瑞士、圣马力诺、亚速尔和马德拉群岛(葡)、直布罗陀、塞浦路斯、亚美尼亚" }
        },
        small_packet: {
            "1": { name: "第1组", note: "格鲁吉亚" },
            "2": { name: "第2组", note: "阿塞拜疆、韩国、日本、阿尔巴尼亚、爱尔兰、爱沙尼亚、奥地利、白俄罗斯、保加利亚、比利时、冰岛、波兰、丹麦、德国、法国、芬兰、荷兰、捷克、克罗地亚、拉脱维亚、立陶宛、卢森堡、罗马尼亚、马耳他、摩尔多瓦、挪威、葡萄牙、瑞典、塞尔维亚、斯洛伐克、斯洛文尼亚、乌克兰、西班牙、希腊、匈牙利、意大利、英国、加拿大、美国、澳大利亚" },
            "3": { name: "第3组", note: "俄罗斯、科摩罗、圣多美和普林西比、莱索托、安圭拉岛(英)、巴拉圭、巴西、百慕大、波多黎各、玻利维亚、格陵兰、美属维尔京群岛、圣皮埃尔和密克隆、安道尔、波黑、法罗群岛、梵蒂冈、黑山、列支敦士登、北马其顿、摩纳哥、瑞士、圣马力诺、亚速尔和马德拉群岛(葡)、直布罗陀、塞浦路斯、亚美尼亚" }
        }
    }
};

// =================================================================================
// 页面加载后执行的初始化代码
// =================================================================================

window.onload = function() {
    // DOM 元素获取
    const D = document;
    const level1Select = D.getElementById('level1-service');
    const domesticRegionContainer = D.getElementById('domestic-region-container');
    const level2Container = D.getElementById('level2-container');
    const level2Select = D.getElementById('level2-service');
    const intlOptsContainer = D.getElementById('intl-options-container');
    const transportContainer = D.getElementById('transport-mode-container');
    const transportSelect = D.getElementById('transport-mode');
    const groupContainer = D.getElementById('intl-group-container');
    const groupSelect = D.getElementById('intl-group');
    const groupNote = D.getElementById('intl-group-note');
    const addonsContainer = D.getElementById('addons-container');
    const addonsCheckboxes = D.getElementById('addons-checkboxes');
    const insuredContainer = D.getElementById('insured-container');
    const weightContainer = D.getElementById('weight-container');

    function init() {
        level1Select.innerHTML = '<option value="">请选择业务大类</option>';
        for (const key in services) {
            level1Select.add(new Option(services[key].name, key));
        }
        level1Select.onchange = onLevel1Change;
        level2Select.onchange = onLevel2Change;
        transportSelect.onchange = updateIntlGroups;
        addonsCheckboxes.onchange = onAddonsChange;
    }

    function onLevel1Change() {
        const l1 = level1Select.value;
        resetUI();
        if (!l1) return;

        domesticRegionContainer.style.display = (l1 === 'domestic') ? 'block' : 'none';
        level2Container.style.display = 'block';
        level2Select.innerHTML = '<option value="">请选择邮件种类</option>';
        const types = services[l1].types;
        for (const key in types) {
            level2Select.add(new Option(types[key].name, key));
        }

        if (l1 === 'international') {
            intlOptsContainer.style.display = 'block';
            transportContainer.style.display = 'block';
            transportSelect.innerHTML = '<option value="">请选择运输方式</option>';
            const modes = services[l1].transportModes;
            for (const key in modes) {
                transportSelect.add(new Option(modes[key], key));
            }
        }
    }

    function onLevel2Change() {
        const l1 = level1Select.value;
        const l2 = level2Select.value;
        
        addonsContainer.style.display = 'none';
        insuredContainer.style.display = 'none';
        weightContainer.style.display = 'none';
        groupContainer.style.display = 'none';
        if (l1 === 'international') {
            transportSelect.value = '';
            transportContainer.style.display = 'block';
        }

        if (!l2) return;

        const serviceInfo = services[l1].types[l2];
        updateAddons();

        if (serviceInfo.weightRequired) {
            weightContainer.style.display = 'block';
            D.getElementById('weight').placeholder = `请输入邮件重量 (最大 ${serviceInfo.maxWeight}克)`;
            D.getElementById('weight').value = '';
        }

        if (l1 === 'international') {
            transportSelect.disabled = (l2 === 'aerogramme');
            if (l2 === 'aerogramme') {
                transportSelect.value = 'air';
            }
        }
        updateIntlGroups();
    }
    
    function onAddonsChange(event) {
        if (!event.target.matches('input[type="checkbox"]')) return;
        
        const insuredCheckbox = D.getElementById('addon-insured');
        if (insuredCheckbox) {
             insuredContainer.style.display = insuredCheckbox.checked ? 'block' : 'none';
             if (!insuredCheckbox.checked) {
                D.getElementById('insured-amount').value = '';
             }
        }

        // *** 最终正确的逻辑: 回执依赖于“挂号” ***
        const registerCheckbox = D.getElementById('addon-register');
        const receiptCheckbox = D.getElementById('addon-receipt');
        
        if (receiptCheckbox) {
            if (registerCheckbox && registerCheckbox.checked) {
                receiptCheckbox.disabled = false;
            } else {
                receiptCheckbox.disabled = true;
                receiptCheckbox.checked = false;
            }
        }
    }

    function resetUI() {
        [level2Container, domesticRegionContainer, intlOptsContainer, transportContainer, groupContainer, addonsContainer, insuredContainer, weightContainer].forEach(el => el.style.display = 'none');
        D.getElementById('result').innerHTML = '';
    }

    function updateAddons() {
        const l1 = level1Select.value;
        const l2 = level2Select.value;
        addonsContainer.style.display = 'none';
        addonsCheckboxes.innerHTML = '';
        if (!l1 || !l2) return;
        
        const serviceAddons = services[l1].types[l2].addons;
        if (serviceAddons && serviceAddons.length > 0) {
            addonsContainer.style.display = 'block';
            let hasReceipt = false;
            serviceAddons.forEach(addonKey => {
                const addonInfo = addons[addonKey];
                const checkboxId = `addon-${addonKey}`;
                addonsCheckboxes.innerHTML += `<div class="addon-item"><input type="checkbox" id="${checkboxId}" value="${addonKey}"><label for="${checkboxId}">${addonInfo.name}</label></div>`;
                if (addonKey === 'receipt') {
                    hasReceipt = true;
                }
            });
            
            if (hasReceipt) {
                D.getElementById('addon-receipt').disabled = true;
            }
        }
    }
    
    function updateIntlGroups() {
        const l1 = level1Select.value;
        const l2 = level2Select.value;
        const transport = transportSelect.value;
        groupContainer.style.display = 'none';
        groupSelect.innerHTML = '';
        groupNote.textContent = '';

        if (l1 !== 'international' || !l2 || !transport || transport === 'surface') {
            return;
        }

        const groupsForTransport = intlGroups[transport];
        if (!groupsForTransport) return;

        const groupType = groupsForTransport[l2] || groupsForTransport['printed'];
        if (!groupType) return;
        
        groupContainer.style.display = 'block';
        groupSelect.innerHTML = '<option value="">请选择分组</option>';
        for (const key in groupType) {
            groupSelect.add(new Option(groupType[key].name, key));
        }
        
        groupSelect.onchange = () => {
            const groupKey = groupSelect.value;
            groupNote.textContent = groupKey ? groupType[groupKey].note : '';
        };
    }

    init();
};

// =================================================================================
// 全局资费计算函数 (详细风格)
// =================================================================================

function calculatePostage() {
    const D = document;
    const resultDiv = D.getElementById('result');
    resultDiv.innerHTML = '';

    // 1. 获取所有用户输入
    const l1 = D.getElementById('level1-service').value;
    const l2 = D.getElementById('level2-service').value;
    if (!l1 || !l2) {
        resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择完整的业务类型！</span>`;
        return;
    }
    const serviceInfo = services[l1].types[l2];
    const weight = parseInt(D.getElementById('weight').value) || 0;

    // 2. 输入验证
    if (serviceInfo.weightRequired && weight <= 0) {
        resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请输入有效的邮件重量！</span>`;
        return;
    }
    if (weight > serviceInfo.maxWeight) {
        resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">超出该业务最大重量限制：${serviceInfo.maxWeight}克！</span>`;
        return;
    }

    let baseFee = 0;
    let detail = [];
    let addonFee = 0;
    const isInsured = D.getElementById('addon-insured') && D.getElementById('addon-insured').checked;

    // 3. 计算主体业务费用 (Base Fee)
    if (l1 === 'domestic') {
        const region = D.getElementById('domestic-region').value;
        const regionText = region === 'local' ? '本埠' : '外埠';
        detail.push(`国内${serviceInfo.name}(${regionText}) ${serviceInfo.weightRequired ? weight+'g' : ''}`);

        switch (l2) {
            case 'letter':
                if (region === 'local') {
                    if (weight <= 100) {
                        baseFee = Math.ceil(weight / 20) * 0.80;
                    } else {
                        baseFee = 4.00 + Math.ceil((weight - 100) / 100) * 1.20;
                    }
                } else { // 外埠
                    if (weight <= 100) {
                        baseFee = Math.ceil(weight / 20) * 1.20;
                    } else {
                        baseFee = 6.00 + Math.ceil((weight - 100) / 100) * 2.00;
                    }
                }
                break;
            case 'printed':
                 if (region === 'local') {
                    if (weight <= 100) {
                        baseFee = 0.80;
                    } else {
                        baseFee = 0.80 + Math.ceil((weight - 100) / 100) * 0.20;
                    }
                } else { // 外埠
                    if (weight <= 100) {
                        baseFee = 1.20;
                    } else {
                        baseFee = 1.20 + Math.ceil((weight - 100) / 100) * 0.40;
                    }
                }
                break;
            case 'postcard':
                baseFee = 0.80;
                break;
        }
    } else if (l1 === 'hkmotw') {
        detail.push(`港澳台${serviceInfo.name} ${serviceInfo.weightRequired ? weight+'g' : ''}`);
        switch (l2) {
            case 'letter':
                if (weight <= 20) baseFee = 1.50;
                else if (weight <= 50) baseFee = 2.80;
                else if (weight <= 100) baseFee = 4.00;
                else if (weight <= 250) baseFee = 8.50;
                else if (weight <= 500) baseFee = 16.70;
                else if (weight <= 1000) baseFee = 31.70;
                else baseFee = 55.80;
                break;
            case 'printed':
                 baseFee = (weight <= 20) ? 3.50 : 3.50 + Math.ceil((weight - 20) / 10) * 1.30;
                 break;
            case 'postcard':
                 baseFee = 3.50;
                 break;
            case 'small_packet':
                 baseFee = (weight <= 100) ? 15.00 : 15.00 + Math.ceil((weight - 100) / 100) * 13.00;
                 break;
            case 'aerogramme':
                 baseFee = 1.80;
                 break;
        }
    } else if (l1 === 'international') {
        const transport = D.getElementById('transport-mode').value;
        const group = D.getElementById('intl-group').value;
        
        if (!transport) { resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择运输方式！</span>`; return; }
        if (transport !== 'surface' && !group && serviceInfo.weightRequired) { resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择分组！</span>`; return; }
        
        const transportName = services.international.transportModes[transport];
        detail.push(`国际${serviceInfo.name}(${transportName}, ${group?`G${group}`:'-'}, ${serviceInfo.weightRequired ? weight+'g' : ''})`);

        switch (transport) {
            case 'air':
                if (l2 === 'letter') { const r = {'1':[5,1],'2':[5.5,1.5],'3':[6,1.8],'4':[7,2.3]}; baseFee = weight<=20?r[group][0]:r[group][0]+Math.ceil((weight-20)/10)*r[group][1]; }
                else if (l2 === 'printed') { const r = {'1':[4.5,2.2],'2':[5,2.5],'3':[6,2.8]}; baseFee = weight<=20?r[group][0]:r[group][0]+Math.ceil((weight-20)/10)*r[group][1]; }
                else if (l2 === 'small_packet') { const r = {'1':[25,23],'2':[30,27],'3':[35,33]}; baseFee = weight<=100?r[group][0]:r[group][0]+Math.ceil((weight-100)/100)*r[group][1]; }
                else if (l2 === 'postcard') baseFee = 5.00;
                else if (l2 === 'aerogramme') baseFee = 5.50;
                break;
            case 'sal':
                 if (l2 === 'letter') { const r = {'1':[4.5,0.5],'2':[5,0.6],'3':[5.5,0.7],'4':[6.5,0.8]}; baseFee = weight<=20?r[group][0]:r[group][0]+Math.ceil((weight-20)/10)*r[group][1]; }
                 else if (l2 === 'printed') { const r = {'1':[4,1.9],'2':[4.5,2.2],'3':[5,2.5]}; baseFee = weight<=20?r[group][0]:r[group][0]+Math.ceil((weight-20)/10)*r[group][1]; }
                 else if (l2 === 'small_packet') { const r = {'1':[22,18],'2':[27,23],'3':[32,28]}; baseFee = weight<=100?r[group][0]:r[group][0]+Math.ceil((weight-100)/100)*r[group][1]; }
                 else if (l2 === 'postcard') baseFee = 4.50;
                 break;
            case 'surface':
                 if (l2 === 'letter') baseFee = (weight <= 20) ? 4.00 : 4.00 + Math.ceil((weight - 20) / 10) * 0.50;
                 else if (l2 === 'printed') baseFee = (weight <= 20) ? 4.00 : 4.00 + Math.ceil((weight - 20) / 10) * 1.80;
                 else if (l2 === 'small_packet') baseFee = (weight <= 100) ? 18.00 : 18.00 + Math.ceil((weight - 100) / 100) * 13.00;
                 else if (l2 === 'postcard') baseFee = 3.50;
                 break;
        }
    }

    // 4. 计算附加业务费用 (Addon Fee)
    if (isInsured && (l1 === 'hkmotw' || l1 === 'international')) {
        addonFee += 18.00;
        detail.push(`保价函件手续费: 18.00`);
    }

    const selectedAddons = Array.from(D.querySelectorAll('#addons-checkboxes input:checked')).map(cb => cb.value);
    for (const addonKey of selectedAddons) {
        let currentFee = 0;
        let feeDetail = '';
        
        switch (addonKey) {
            case 'register':
                if (isInsured && (l1 === 'hkmotw' || l1 === 'international')) {
                    continue; // 保价函件已含挂号费，不再重复计算
                }
                currentFee = (l1 === 'domestic') ? 3.00 : 16.00;
                feeDetail = `挂号费: ${currentFee.toFixed(2)}`;
                break;
            case 'receipt':
                if (l1==='hkmotw' && confirm("寄达地是台湾吗？台湾暂不办理回执。")) {
                    D.getElementById('addon-receipt').checked = false;
                    continue;
                }
                currentFee = (l1 === 'domestic' || l1 === 'hkmotw') ? 3.00 : 5.00;
                feeDetail = `回执费: ${currentFee.toFixed(2)}`;
                break;
            case 'insured':
                const amount = parseInt(D.getElementById('insured-amount').value);
                if (!amount || amount <= 0) {
                     resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请输入有效的保价金额！</span>`;
                     return;
                }
                if (l1 === 'domestic') {
                    currentFee = (amount <= 100) ? 1.00 : amount * 0.01;
                } else if (l1 === 'hkmotw') {
                    currentFee = Math.ceil(amount / 200) * 3.00;
                } else { // international
                    currentFee = Math.ceil(amount / 100) * 1.00;
                }
                feeDetail = `保价费(保额${amount}): ${currentFee.toFixed(2)}`;
                break;
        }
        addonFee += currentFee;
        if (feeDetail) {
            detail.push(feeDetail);
        }
    }
    
    // 5. 显示最终结果
    const totalFee = baseFee + addonFee;
    if (totalFee > 0 || !serviceInfo.weightRequired) {
        resultDiv.innerHTML = `所需总资费：<span style="color:#f9a825;font-size:1.3em;">${totalFee.toFixed(2)} 元</span><br><span style="font-size:0.9em;color:#888;">计算明细：${detail.join(' + ')}</span>`;
    } else if (weight > 0 || l1) {
        resultDiv.innerHTML = `<span style="color:orange;font-weight:bold;">请检查输入。该业务组合的计费规则可能暂未覆盖。</span>`;
    }
}