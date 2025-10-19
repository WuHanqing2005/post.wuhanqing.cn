window.onload = function() {
    // 动态显示分组和保价金额 + 自动补充寄达地
    const serviceSelect = document.getElementById('service');
    const regionSelect = document.getElementById('region');
    const groupDiv = document.getElementById('groupDiv');
    const insuredDiv = document.getElementById('insuredDiv');

    // 业务类型与寄达地的有效组合
    const validCombos = {
        'domestic_letter': ['local', 'domestic'],
        'domestic_printed': ['local', 'domestic'],
        'domestic_postcard': ['local', 'domestic'],
        'domestic_registered': ['local', 'domestic'],
        'domestic_receipt': ['local', 'domestic'],
        'domestic_insured': ['local', 'domestic'],
        'hkmo_letter': ['hkmo'],
        'hkmo_printed': ['hkmo'],
        'hkmo_postcard': ['hkmo'],
        'hkmo_registered': ['hkmo'],
        'hkmo_small_packet': ['hkmo'],
        'intl_air_letter': ['international'],
        'intl_air_printed': ['international'],
        'intl_air_postcard': ['international'],
        'intl_registered': ['international'],
        'intl_insured': ['international'],
        'intl_small_packet': ['international']
    };

    serviceSelect.onchange = function() {
        const val = serviceSelect.value;
        // 自动补充寄达地
        if (validCombos[val].length === 1) {
            regionSelect.value = validCombos[val][0];
        }
        groupDiv.style.display = (
            val === 'intl_air_letter' ||
            val === 'intl_air_printed' ||
            val === 'intl_air_postcard' ||
            val === 'intl_small_packet'
        ) ? 'block' : 'none';
        insuredDiv.style.display = (
            val === 'domestic_insured' ||
            val === 'intl_insured'
        ) ? 'block' : 'none';
    };
    serviceSelect.onchange(); // 初始化
};

const groupCountryMap = {
    '1': '亚洲邻近国家：朝鲜、蒙古、越南、日本、韩国、哈萨克斯坦、吉尔吉斯斯坦、塔吉克斯坦、乌兹别克斯坦、土库曼斯坦等',
    '2': '其他亚洲国家/地区、部分欧洲、美加澳新：阿塞拜疆、土耳其、伊拉克、约旦、越南、阿尔巴尼亚、爱尔兰、奥地利、比利时、冰岛、波兰、丹麦、德国、法国、芬兰、荷兰、捷克、加拿大、美国、澳大利亚、新西兰等',
    '3': '其他欧洲、美洲、大洋洲、非洲：俄罗斯、巴西、阿根廷、南非、埃及等',
    '4': '美洲其他国家/地区、非洲、大洋洲其他国家/地区：秘鲁、智利、尼日利亚、肯尼亚、斐济等'
};

const validCombos = {
    'domestic_letter': ['local', 'domestic'],
    'domestic_printed': ['local', 'domestic'],
    'domestic_postcard': ['local', 'domestic'],
    'domestic_registered': ['local', 'domestic'],
    'domestic_receipt': ['local', 'domestic'],
    'domestic_insured': ['local', 'domestic'],
    'hkmo_letter': ['hkmo'],
    'hkmo_printed': ['hkmo'],
    'hkmo_postcard': ['hkmo'],
    'hkmo_registered': ['hkmo'],
    'hkmo_small_packet': ['hkmo'],
    'intl_air_letter': ['international'],
    'intl_air_printed': ['international'],
    'intl_air_postcard': ['international'],
    'intl_registered': ['international'],
    'intl_insured': ['international'],
    'intl_small_packet': ['international']
};

function calculatePostage() {
    const service = document.getElementById('service').value;
    const weight = parseInt(document.getElementById('weight').value, 10);
    const region = document.getElementById('region').value;
    const group = document.getElementById('group') ? document.getElementById('group').value : null;
    let fee = 0, detail = '';

    // 校验业务类型与寄达地组合
    if (!validCombos[service].includes(region)) {
        document.getElementById('result').innerHTML =
            `<span style="color:red;font-weight:bold;">业务类型与寄达地组合不合理，请重新选择！</span>`;
        return;
    }

    // 超重限制（按中国邮政标准）
    const limits = {
        'domestic_letter': 2000,
        'domestic_printed': 2000,
        'domestic_postcard': 20,
        'domestic_registered': 2000,
        'domestic_receipt': 2000,
        'domestic_insured': 2000,
        'hkmo_letter': 2000,
        'hkmo_printed': 2000,
        'hkmo_postcard': 20,
        'hkmo_registered': 2000,
        'hkmo_small_packet': 2000,
        'intl_air_letter': 2000,
        'intl_air_printed': 2000,
        'intl_air_postcard': 20,
        'intl_registered': 2000,
        'intl_insured': 2000,
        'intl_small_packet': 2000
    };

    if (isNaN(weight) || weight <= 0) {
        document.getElementById('result').textContent = '请输入有效的重量！';
        return;
    }
    if (limits[service] && weight > limits[service]) {
        document.getElementById('result').innerHTML =
            `<span style="color:red;font-weight:bold;">超出该业务最大重量限制：${limits[service]}克，请分拆或选择其他业务！</span>`;
        return;
    }

    // 国内信函
    if (service === 'domestic_letter') {
        if (region === 'local') {
            if (weight <= 100) {
                fee = Math.ceil(weight / 20) * 0.8;
                detail = '本地信函：每20克0.8元';
            } else {
                fee = Math.ceil(100 / 20) * 0.8 + Math.ceil((weight - 100) / 100) * 1.2;
                detail = '本地信函：100克及以内每20克0.8元，超出部分每100克1.2元';
            }
        } else if (region === 'domestic') {
            if (weight <= 100) {
                fee = Math.ceil(weight / 20) * 1.2;
                detail = '国内信函：每20克1.2元';
            } else {
                fee = Math.ceil(100 / 20) * 1.2 + Math.ceil((weight - 100) / 100) * 2.0;
                detail = '国内信函：100克及以内每20克1.2元，超出部分每100克2元';
            }
        }
    }
    // 国内印刷品
    else if (service === 'domestic_printed') {
        if (region === 'local') {
            if (weight <= 100) {
                fee = 0.8;
                detail = '本地印刷品：100克及以内0.8元';
            } else {
                fee = 0.8 + Math.ceil((weight - 100) / 100) * 0.2;
                detail = '本地印刷品：100克及以内0.8元，超出部分每100克0.2元';
            }
        } else if (region === 'domestic') {
            if (weight <= 100) {
                fee = 1.2;
                detail = '国内印刷品：100克及以内1.2元';
            } else {
                fee = 1.2 + Math.ceil((weight - 100) / 100) * 0.4;
                detail = '国内印刷品：100克及以内1.2元，超出部分每100克0.4元';
            }
        }
    }
    // 国内明信片
    else if (service === 'domestic_postcard') {
        fee = 0.8;
        detail = '国内明信片：每件0.8元';
    }
    // 国内挂号信
    else if (service === 'domestic_registered') {
        let baseFee = 0;
        if (region === 'local') {
            if (weight <= 100) baseFee = Math.ceil(weight / 20) * 0.8;
            else baseFee = Math.ceil(100 / 20) * 0.8 + Math.ceil((weight - 100) / 100) * 1.2;
        } else if (region === 'domestic') {
            if (weight <= 100) baseFee = Math.ceil(weight / 20) * 1.2;
            else baseFee = Math.ceil(100 / 20) * 1.2 + Math.ceil((weight - 100) / 100) * 2.0;
        }
        fee = baseFee + 3.0;
        detail = '国内挂号信：信函资费+挂号费3元';
    }
    // 国内回执
    else if (service === 'domestic_receipt') {
        fee = 3.0;
        detail = '国内回执：每件3元';
    }
    // 国内保价
    else if (service === 'domestic_insured') {
        const insuredAmount = parseInt(document.getElementById('insuredAmount').value, 10);
        if (isNaN(insuredAmount) || insuredAmount <= 0) {
            document.getElementById('result').textContent = '请输入有效的保价金额！';
            return;
        }
        if (insuredAmount <= 100) fee = 1.0;
        else fee = insuredAmount * 0.01;
        detail = '国内保价：每笔保价金额的1%，100元及以内1元';
    }
    // 港澳台信函
    else if (service === 'hkmo_letter') {
        if (weight <= 20) fee = 1.5;
        else if (weight <= 50) fee = 2.8;
        else if (weight <= 100) fee = 4.0;
        else if (weight <= 250) fee = 8.5;
        else if (weight <= 500) fee = 16.7;
        else if (weight <= 1000) fee = 31.7;
        else if (weight <= 2000) fee = 55.8;
        else fee = 55.8 + Math.ceil((weight - 2000) / 1000) * 24.1;
        detail = '港澳台信函资费';
    }
    // 港澳台印刷品
    else if (service === 'hkmo_printed') {
        if (weight <= 20) fee = 3.5;
        else fee = 3.5 + Math.ceil((weight - 20) / 10) * 1.3;
        detail = '港澳台印刷品：20克3.5元，续重每10克1.3元';
    }
    // 港澳台明信片
    else if (service === 'hkmo_postcard') {
        fee = 3.5;
        detail = '港澳台明信片：每件3.5元';
    }
    // 港澳台挂号
    else if (service === 'hkmo_registered') {
        fee = 16.0;
        detail = '港澳台挂号：每件16元';
    }
    // 港澳台小包
    else if (service === 'hkmo_small_packet') {
        if (weight <= 100) fee = 15.0;
        else fee = 15.0 + Math.ceil((weight - 100) / 100) * 13.0;
        detail = '港澳台小包：100克15元，续重每100克13元';
    }
    // 国际航空信函
    else if (service === 'intl_air_letter') {
        let base = 0, step = 0;
        if (group === '1') { base = 5.0; step = 1.0; }
        else if (group === '2') { base = 5.5; step = 1.5; }
        else if (group === '3') { base = 6.0; step = 1.8; }
        else if (group === '4') { base = 7.0; step = 2.3; }
        if (weight <= 20) fee = base;
        else fee = base + Math.ceil((weight - 20) / 10) * step;
        detail = `国际航空信函：${groupCountryMap[group]}，首重20克${base}元，续重每10克${step}元`;
    }
    // 国际航空印刷品
    else if (service === 'intl_air_printed') {
        let base = 0, step = 0;
        if (group === '1') { base = 4.5; step = 2.2; }
        else if (group === '2') { base = 5.0; step = 2.5; }
        else if (group === '3') { base = 6.0; step = 2.8; }
        if (weight <= 20) fee = base;
        else fee = base + Math.ceil((weight - 20) / 10) * step;
        detail = `国际航空印刷品：${groupCountryMap[group]}，首重20克${base}元，续重每10克${step}元`;
    }
    // 国际航空明信片
    else if (service === 'intl_air_postcard') {
        fee = 5.0;
        detail = '国际航空明信片：每件5元';
    }
    // 国际挂号
    else if (service === 'intl_registered') {
        fee = 16.0;
        detail = '国际挂号：每件16元';
    }
    // 国际保价函件
    else if (service === 'intl_insured') {
        const insuredAmount = parseInt(document.getElementById('insuredAmount').value, 10);
        if (isNaN(insuredAmount) || insuredAmount <= 0) {
            document.getElementById('result').textContent = '请输入有效的保价金额！';
            return;
        }
        fee = Math.ceil(insuredAmount / 200) * 3.0;
        detail = '国际保价函件：每保200元3元';
    }
    // 国际小包
    else if (service === 'intl_small_packet') {
        let base = 0, step = 0;
        if (group === '1') { base = 25.0; step = 23.0; }
        else if (group === '2') { base = 30.0; step = 27.0; }
        else if (group === '3') { base = 35.0; step = 33.0; }
        else if (group === '4') { base = 40.0; step = 38.0; }
        if (weight <= 100) fee = base;
        else fee = base + Math.ceil((weight - 100) / 100) * step;
        detail = `国际小包：${groupCountryMap[group]}，首重100克${base}元，续重每100克${step}元`;
    }

    if (fee < 0) fee = 0;
    document.getElementById('result').innerHTML = `所需资费：<span style="color:#f9a825;font-size:1.3em;">${fee.toFixed(2)} 元</span><br><span style="font-size:0.9em;color:#888;">${detail}</span>`;
}