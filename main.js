// =================================================================================
// 数据定义 (移至全局作用域以供所有函数访问)
// =================================================================================

const services = {
    "domestic": {
        name: "国内邮件",
        types: {
            "letter": { name: "信函", weightRequired: true, maxWeight: 2000, addons: ["register", "receipt", "insured"] },
            "printed": { name: "印刷品", weightRequired: true, maxWeight: 5000, addons: ["register", "receipt", "insured"] },
            "postcard": { name: "明信片", weightRequired: false, maxWeight: 20, addons: ["register", "receipt"] },
            // 国内包裹逻辑复杂，暂未完全纳入以简化函件计算
            // "parcel": { name: "普通包裹", weightRequired: true, maxWeight: 15000, addons: ["insured"] } 
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
        transportModes: {
            "air": "航空",
            "sal": "空运水陆路 (SAL)",
            "surface": "水陆路"
        },
        types: {
            "letter": { name: "信函", weightRequired: true, maxWeight: 2000, addons: ["register", "receipt", "insured"] },
            "printed": { name: "印刷品", weightRequired: true, maxWeight: 5000, addons: ["register", "receipt", "insured"] },
            "postcard": { name: "明信片", weightRequired: false, maxWeight: 20, addons: ["register", "receipt"] },
            "small_packet": { name: "小包", weightRequired: true, maxWeight: 2000, addons: ["register", "insured"] },
            "aerogramme": { name: "航空邮简", weightRequired: false, maxWeight: 10, transport: ["air"] } // 仅航空
        }
    }
};

const addons = {
    "register": { name: "挂号", conflicts: [] },
    "receipt": { name: "回执", conflicts: [], depends: "register" },
    "insured": { name: "保价", conflicts: [] }
};

const intlGroups = {
    air: { // 航空
        letter: {
            "1": { name: "第1组: 朝/蒙/越/日/韩/中亚五国", note: "朝鲜、蒙古、越南、日本、韩国、哈萨克斯坦、吉尔吉斯斯坦、塔吉克斯坦、乌兹别克斯坦、土库曼斯坦" },
            "2": { name: "第2组: 其他亚洲国家/地区", note: "除第1组外的其他亚洲国家或地区" },
            "3": { name: "第3组: 欧美/澳新", note: "欧洲、美国、加拿大、澳大利亚、新西兰" },
            "4": { name: "第4组: 其他地区", note: "美洲其他、非洲、大洋洲其他" }
        },
        printed: {
            "1": { name: "第1组: 部分亚洲国家", note: "阿联酋、阿曼、巴基斯坦、巴林、菲律宾、格鲁吉亚...等21国" },
            "2": { name: "第2组: 日韩/欧美/澳新等", note: "日、韩、欧美、澳新等52个国家和地区" },
            "3": { name: "第3组: 其他国家和地区", note: "上述未包含的其他国家和地区" }
        },
        small_packet: {
            "1": { name: "第1组", note: "同印刷品第1组" }, "2": { name: "第2组", note: "同印刷品第2组" }, "3": { name: "第3组", note: "同印刷品第3组" }
        }
    },
    sal: { // 空运水陆路
        letter: {
            "1": { name: "第1组: 日/韩", note: "日本、韩国" },
            "2": { name: "第2组: 塞浦路斯", note: "塞浦路斯" },
            "3": { name: "第3组: 欧美澳等", note: "亚美尼亚、阿塞拜疆、格鲁吉亚、欧洲大部分国家、美、加、澳" },
            "4": { name: "第4组: 巴西/非洲部分岛国等", note: "科摩罗、莱索托、巴西、格陵兰等" }
        },
        printed: {
            "1": { name: "第1组: 格鲁吉亚", note: "格鲁吉亚" },
            "2": { name: "第2组: 日韩/欧美澳等", note: "日、韩、欧美澳等40个国家和地区" },
            "3": { name: "第3组: 俄罗斯/巴西等", note: "俄罗斯、巴西及其他20余个国家和地区" }
        },
        small_packet: {
            "1": { name: "第1组", note: "同印刷品第1组" }, "2": { name: "第2组", note: "同印刷品第2组" }, "3": { name: "第3组", note: "同印刷品第3组" }
        }
    }
    // 水陆路(surface)通常不分组，或有特殊路向，此处简化为统一资费
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

    // 初始化一级业务下拉列表
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

    // 事件处理器
    function onLevel1Change() {
        const l1 = level1Select.value;
        resetUI(); // 重置界面
        if (!l1) return;

        // 国内邮件显示“本埠/外埠”选项
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
        
        // 重置二级之后的所有UI
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

        updateAddons(); // 更新附加业务

        // 更新重量输入框
        if (serviceInfo.weightRequired) {
            weightContainer.style.display = 'block';
            D.getElementById('weight').placeholder = `请输入邮件重量 (最大 ${serviceInfo.maxWeight}克)`;
            D.getElementById('weight').value = '';
        } else {
            weightContainer.style.display = 'none';
        }
        
        // 国际航空邮简只能是航空
        if (l1 === 'international' && l2 === 'aerogramme') {
            transportSelect.value = 'air';
            transportSelect.disabled = true;
        } else if (l1 === 'international') {
            transportSelect.disabled = false;
        }
        updateIntlGroups();
    }
    
    function onAddonsChange(event) {
        if (!event.target.matches('input[type="checkbox"]')) return;

        // 保价金额输入框的显示/隐藏
        const insuredCheckbox = D.getElementById('addon-insured');
        if (insuredCheckbox) {
             insuredContainer.style.display = insuredCheckbox.checked ? 'block' : 'none';
             if (!insuredCheckbox.checked) D.getElementById('insured-amount').value = '';
        }

        // 回执必须依赖挂号
        const registerCheckbox = D.getElementById('addon-register');
        const receiptCheckbox = D.getElementById('addon-receipt');
        if (receiptCheckbox) {
            if (registerCheckbox && !registerCheckbox.checked) {
                receiptCheckbox.checked = false;
                receiptCheckbox.disabled = true;
            } else {
                receiptCheckbox.disabled = false;
            }
        }
    }

    // UI 更新函数
    function resetUI() {
        level2Container.style.display = 'none';
        domesticRegionContainer.style.display = 'none';
        intlOptsContainer.style.display = 'none';
        transportContainer.style.display = 'none';
        groupContainer.style.display = 'none';
        addonsContainer.style.display = 'none';
        insuredContainer.style.display = 'none';
        weightContainer.style.display = 'none';
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
                // 使用新的CSS class 'addon-item'
                const checkbox = `<div class="addon-item"><input type="checkbox" id="${checkboxId}" value="${addonKey}"><label for="${checkboxId}">${addonInfo.name}</label></div>`;
                addonsCheckboxes.innerHTML += checkbox;
                if(addonKey === 'receipt') hasReceipt = true;
            });

            if(hasReceipt) {
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
        if (l1 !== 'international' || !l2 || !transport || transport === 'surface') {
            groupNote.textContent = '';
            return;
        }

        const groupsForTransport = intlGroups[transport];
        if (!groupsForTransport) return;

        const groupType = groupsForTransport[l2] || groupsForTransport['printed']; // 找不到特定类型就用印刷品的
        if(!groupType) return;
        
        groupContainer.style.display = 'block';
        groupSelect.innerHTML = '<option value="">请选择分组</option>';
        for (const key in groupType) {
            groupSelect.add(new Option(groupType[key].name, key));
        }
        
        groupSelect.onchange = () => {
            const groupKey = groupSelect.value;
            groupNote.textContent = groupKey ? groupType[groupKey].note : '';
        };
        groupNote.textContent = '';
    }

    init(); // 页面加载时执行初始化
};

// =================================================================================
// 全局资费计算函数 (已补全所有逻辑)
// =================================================================================

function calculatePostage() {
    const D = document;
    const resultDiv = D.getElementById('result');
    resultDiv.innerHTML = '';

    // 获取所有输入值
    const l1 = D.getElementById('level1-service').value;
    const l2 = D.getElementById('level2-service').value;
    if (!l1 || !l2) {
        resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择完整的业务类型！</span>`;
        return;
    }

    const serviceInfo = services[l1].types[l2];
    const weight = parseInt(D.getElementById('weight').value) || 0;

    // 输入验证
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

    // --- 1. 计算主体业务费用 (Base Fee) ---
    if (l1 === 'domestic') {
        const region = D.getElementById('domestic-region').value;
        switch (l2) {
            case 'letter':
                if (region === 'local') { // 本埠
                    baseFee = (weight <= 100) ? Math.ceil(weight / 20) * 0.80 : 4.00 + Math.ceil((weight - 100) / 100) * 1.20;
                } else { // 外埠
                    baseFee = (weight <= 100) ? Math.ceil(weight / 20) * 1.20 : 6.00 + Math.ceil((weight - 100) / 100) * 2.00;
                }
                detail.push(`国内信函(${region==='local'?'本埠':'外埠'}) ${weight}g`);
                break;
            case 'printed':
                 if (region === 'local') { // 本埠
                    baseFee = (weight <= 100) ? 0.80 : 0.80 + Math.ceil((weight - 100) / 100) * 0.20;
                } else { // 外埠
                    baseFee = (weight <= 100) ? 1.20 : 1.20 + Math.ceil((weight - 100) / 100) * 0.40;
                }
                detail.push(`国内印刷品(${region==='local'?'本埠':'外埠'}) ${weight}g`);
                break;
            case 'postcard':
                baseFee = 0.80;
                detail.push(`国内明信片`);
                break;
        }
    } else if (l1 === 'hkmotw') {
        switch (l2) {
            case 'letter':
                if (weight <= 20) baseFee = 1.50;
                else if (weight <= 50) baseFee = 2.80;
                else if (weight <= 100) baseFee = 4.00;
                else if (weight <= 250) baseFee = 8.50;
                else if (weight <= 500) baseFee = 16.70;
                else if (weight <= 1000) baseFee = 31.70;
                else baseFee = 55.80;
                detail.push(`港澳台信函 ${weight}g`);
                break;
            case 'printed':
                 baseFee = (weight <= 20) ? 3.50 : 3.50 + Math.ceil((weight - 20) / 10) * 1.30;
                 detail.push(`港澳台印刷品 ${weight}g`);
                 break;
            case 'postcard':
                 baseFee = 3.50;
                 detail.push(`港澳台明信片`);
                 break;
            case 'small_packet':
                 baseFee = (weight <= 100) ? 15.00 : 15.00 + Math.ceil((weight - 100) / 100) * 13.00;
                 detail.push(`港澳台小包 ${weight}g`);
                 break;
            case 'aerogramme':
                 baseFee = 1.80;
                 detail.push(`航空邮简`);
                 break;
        }
    } else if (l1 === 'international') {
        const transport = D.getElementById('transport-mode').value;
        const group = D.getElementById('intl-group').value;
        
        if (!transport) { resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择运输方式！</span>`; return; }
        if (transport !== 'surface' && !group && l2 !== 'postcard' && l2 !== 'aerogramme') { resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">请选择寄达国家/地区分组！</span>`; return; }
        
        const transportName = services.international.transportModes[transport];
        
        switch (transport) {
            case 'air':
                if (l2 === 'letter') {
                    const rates = { '1': [5.00, 1.00], '2': [5.50, 1.50], '3': [6.00, 1.80], '4': [7.00, 2.30] };
                    baseFee = (weight <= 20) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 20) / 10) * rates[group][1];
                } else if (l2 === 'printed') {
                    const rates = { '1': [4.50, 2.20], '2': [5.00, 2.50], '3': [6.00, 2.80] };
                    baseFee = (weight <= 20) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 20) / 10) * rates[group][1];
                } else if (l2 === 'small_packet') {
                    const rates = { '1': [25.00, 23.00], '2': [30.00, 27.00], '3': [35.00, 33.00] };
                    baseFee = (weight <= 100) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 100) / 100) * rates[group][1];
                } else if (l2 === 'postcard') baseFee = 5.00;
                else if (l2 === 'aerogramme') baseFee = 5.50;
                break;
            case 'sal':
                 if (l2 === 'letter') {
                    const rates = { '1': [4.50, 0.50], '2': [5.00, 0.60], '3': [5.50, 0.70], '4': [6.50, 0.80] };
                    baseFee = (weight <= 20) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 20) / 10) * rates[group][1];
                } else if (l2 === 'printed') {
                    const rates = { '1': [4.00, 1.90], '2': [4.50, 2.20], '3': [5.00, 2.50] };
                    baseFee = (weight <= 20) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 20) / 10) * rates[group][1];
                } else if (l2 === 'small_packet') {
                    const rates = { '1': [22.00, 18.00], '2': [27.00, 23.00], '3': [32.00, 28.00] };
                    baseFee = (weight <= 100) ? rates[group][0] : rates[group][0] + Math.ceil((weight - 100) / 100) * rates[group][1];
                } else if (l2 === 'postcard') baseFee = 4.50;
                break;
            case 'surface':
                 if (l2 === 'letter') baseFee = (weight <= 20) ? 4.00 : 4.00 + Math.ceil((weight - 20) / 10) * 0.50;
                 else if (l2 === 'printed') baseFee = (weight <= 20) ? 4.00 : 4.00 + Math.ceil((weight - 20) / 10) * 1.80;
                 else if (l2 === 'small_packet') baseFee = (weight <= 100) ? 18.00 : 18.00 + Math.ceil((weight - 100) / 100) * 13.00;
                 else if (l2 === 'postcard') baseFee = 3.50;
                 break;
        }
        detail.push(`国际${serviceInfo.name} (${transportName}, ${group?`分组${group}`:'-'}, ${weight}g)`);
    }

    // --- 2. 计算附加业务费用 (Addon Fee) ---
    const selectedAddons = Array.from(D.querySelectorAll('#addons-checkboxes input:checked')).map(cb => cb.value);
    for (const addonKey of selectedAddons) {
        let currentAddonFee = 0;
        let addonDetail = '';
        
        switch(addonKey) {
            case 'register':
                currentAddonFee = (l1 === 'domestic') ? 3.00 : 16.00;
                addonDetail = `挂号费: ${currentAddonFee.toFixed(2)}`;
                break;
            case 'receipt':
                // 台湾暂不办理回执
                if (l1 === 'hkmotw' && confirm("寄达地是否为台湾？台湾地区暂不办理回执业务。")) {
                    D.getElementById('addon-receipt').checked = false;
                    alert("已为您取消回执选项。");
                    continue;
                }
                currentAddonFee = (l1 === 'domestic' || l1 === 'hkmotw') ? 3.00 : 5.00;
                addonDetail = `回执费: ${currentAddonFee.toFixed(2)}`;
                break;
            case 'insured':
                const insuredAmount = parseInt(D.getElementById('insured-amount').value);
                if (!insuredAmount || insuredAmount <= 0) {
                     resultDiv.innerHTML = `<span style="color:red;font-weight:bold;">选择了保价，但未输入有效的保价金额！</span>`;
                     return; // 中断计算
                }
                let insuredFee = 0;
                if (l1 === 'domestic') {
                    insuredFee = (insuredAmount <= 100) ? 1.00 : insuredAmount * 0.01;
                } else if (l1 === 'hkmotw') {
                    insuredFee = Math.ceil(insuredAmount / 200) * 3.00;
                    addonFee += 18.00; // 保价手续费
                    detail.push(`港澳台保价手续费: 18.00`);
                } else { // international
                    insuredFee = Math.ceil(insuredAmount / 100) * 1.00;
                    addonFee += 18.00; // 国际保价手续费
                    detail.push(`国际保价手续费: 18.00`);
                }
                currentAddonFee = insuredFee;
                addonDetail = `保价费(保额${insuredAmount}): ${insuredFee.toFixed(2)}`;
                break;
        }
        addonFee += currentAddonFee;
        if(addonDetail) detail.push(addonDetail);
    }

    // --- 3. 显示最终结果 ---
    const totalFee = baseFee + addonFee;
    if (totalFee > 0 || !serviceInfo.weightRequired) {
        resultDiv.innerHTML = `所需总资费：<span style="color:#f9a825;font-size:1.3em;">${totalFee.toFixed(2)} 元</span><br><span style="font-size:0.9em;color:#888;">计算明细：${detail.join(' + ')}</span>`;
    } else if (weight > 0) {
        // 未匹配到任何计费规则
        resultDiv.innerHTML = `<span style="color:orange;font-weight:bold;">抱歉，该业务组合的计费规则暂未覆盖，请以邮局为准。</span>`;
    }
}