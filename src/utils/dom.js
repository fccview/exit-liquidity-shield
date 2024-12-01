const dom = {
  createStatsDiv() {
    // Create floating button
    const floatingBtn = document.createElement('div');
    floatingBtn.id = 'wallet-stats-toggle';

    // Try to use browser-specific runtime API, fallback to emoji if not available
    const getExtensionUrl = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL('icons/icon128.png');
      }
      if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.getURL) {
        return browser.runtime.getURL('icons/icon128.png');
      }
      return null;
    };

    const iconUrl = getExtensionUrl();
    floatingBtn.innerHTML = iconUrl
      ? `<img src="${iconUrl}" style="width: 24px; height: 24px;" onerror="this.innerHTML='📊'" />`
      : '📊';
    floatingBtn.style.cssText = `
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 9999;
      font-size: 20px;
      transition: all 0.3s ease;
    `;

    // Create sliding panel
    const statsDiv = document.createElement('div');
    statsDiv.id = 'wallet-stats';
    statsDiv.className = 'p-show__widget p-show__info u-p-0 u-mb-xs u-mb-0-lg';
    statsDiv.style.cssText = `
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100vh;
      background: #1a1a1a;
      box-shadow: -2px 0 10px rgba(0,0,0,0.3);
      transition: right 0.3s ease;
      z-index: 9998;
      overflow-y: auto;
      padding: 20px;
    `;

    // Add close button
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 15px;
      font-size: 24px;
      cursor: pointer;
      color: #fff;
      opacity: 0.7;
    `;

    const style = document.createElement('style');
    style.textContent = `
      body {
        min-width: 100vw!important;
        transition: margin-left 0.3s ease !important;
        position: relative;
      }
      body.wallet-stats-open {
        margin-left: -400px !important;
      }
      body.wallet-stats-open .l-wrapper,
      body.wallet-stats-open .l-container,
      body.wallet-stats-open .p-show,
      body.wallet-stats-open .p-show__content {
        width: calc(100% - 400px) !important;
        transition: width 0.3s ease !important;
      }
      #wallet-stats {
        position: fixed;
        right: -400px;
        top: 0;
        width: 400px;
        height: 100vh;
        background: #1a1a1a;
        box-shadow: -2px 0 10px rgba(0,0,0,0.3);
        transition: right 0.3s ease;
        z-index: 9998;
        overflow-y: auto;
        padding: 20px;
      }
      body.wallet-stats-open #wallet-stats {
        right: 0 !important;
      }
      #wallet-stats-toggle {
        transition: right 0.3s ease;
      }
      body.wallet-stats-open .l-row.l-row-gap--xxs.u-flex-lg-row-reverse {
        width: 100vw!important;
      }
    `;
    document.head.appendChild(style);

    statsDiv.innerHTML = `
      <div class="c-info js-info" style="padding-bottom: 1em">
        <h6 class="u-font-size-zh-3xs u-p-xs" style="text-align: center; padding-bottom: 0.2em!important; margin-bottom: 1em!important">
          Pump & Dump Detection
        </h6>
        <div class="js-info__content" style="padding: 0 0.8em;">
          <div id="wallet-stats-list"></div>
        </div>
      </div>
    `;

    statsDiv.insertBefore(closeBtn, statsDiv.firstChild);

    let isOpen = false;

    // Toggle function
    const togglePanel = () => {
      isOpen = !isOpen;
      if (isOpen) {
        statsDiv.classList.add('open');
        floatingBtn.style.right = '420px';
        document.body.classList.add('wallet-stats-open');
        // Force layout recalculation
        document.body.style.width = 'calc(100% - 400px)';
      } else {
        statsDiv.classList.remove('open');
        floatingBtn.style.right = '20px';
        document.body.classList.remove('wallet-stats-open');
        // Reset layout
        document.body.style.width = '100%';
      }
    };

    // Add click handlers
    floatingBtn.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);

    // Add both elements to body
    document.body.appendChild(floatingBtn);
    document.body.appendChild(statsDiv);

    // Setup filter buttons (moved to after elements are added)
    setTimeout(() => {
      const filterBtn = document.getElementById('filter-bots-btn');
      const whalesBtn = document.getElementById('filter-whales-btn');

      const setupFilterClick = (btn, minAmount) => {
        if (btn) {
          btn.addEventListener('click', () => {
            const filterBtn = document.querySelector('.c-grid-table__th:nth-child(7) .c-icon[data-icon="filter"]');
            if (filterBtn) filterBtn.click();

            setTimeout(() => {
              const minInput = document.querySelector('.c-modal__content input[placeholder="min"]');
              if (minInput) {
                minInput.value = minAmount;
                minInput.dispatchEvent(new Event('input', { bubbles: true }));

                const applyBtn = document.querySelector('.c-modal__content .c-btn:not(.c-btn--lt)');
                if (applyBtn) applyBtn.click();
              }
            }, 100);
          });
        }
      };

      setupFilterClick(filterBtn, '0.001');
      setupFilterClick(whalesBtn, '10');
    }, 0);

    return statsDiv;
  },

  renderWalletStats(wallet, data, threat, tokenFlow, profitLoss) {
    const totalVolume = data.buyAmount + data.sellAmount;

    return `
      <div class="l-row l-row-gap--l u-mt-s" style="margin-top: 0.1em!important; margin-bottom: 0!important">
        <div class="l-col">
          <div class="c-info__cell u-font-size-zh-3xs" style="border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; margin-bottom: 8px;">
            <div class="l-row u-justify-content-between" style="align-items: center;">
              <div class="l-col-auto" style="flex: 1;">
                ${threat.icon} 
                <span class="${threat.class}" title="${wallet}">
                  ${wallet.substring(0, 4)}...${wallet.substring(wallet.length - 3)}
                </span>
                <span class="u-pointer u-ml-2xs" style="opacity: 0.7;" title="Copy address" onclick="navigator.clipboard.writeText('${wallet}')">📋</span>
              </div>
              <div class="l-col-auto" style="flex: 1; text-align: right;">
                <span title="Token Flow">🔄 FLOW: <span class="${tokenFlow >= 0 ? 'u-color-green' : 'u-color-red'}">${tokenFlow >= 0 ? '+' : '-'}${tokenFlow.toFixed(2)}</span></span><br />
                <span title="Profit/Loss">💰 ${profitLoss >= 0 ? 'wins' : 'buying'}: <span class="${profitLoss >= 0 ? 'u-color-green' : 'u-color-red'}">${profitLoss >= 0 ? '+' : ''}${Math.abs(profitLoss).toFixed(2)}</span></span>
              </div>
            </div>
            <div class="l-row u-justify-content-between" style="margin-top: 8px;">
              <div class="l-col-auto" style="flex: 1;">
                <div class="c-info__cell u-font-size-zh-3xs">
                  Buys
                  <div class="c-info__cell__value u-color-green">${data.buys} (${data.buyAmount.toFixed(2)} SOL)</div>
                </div>
              </div>
              <div class="l-col-auto" style="flex: 1; text-align: right;">
                <div class="c-info__cell u-text-right u-font-size-zh-3xs">
                  Sells
                  <div class="c-info__cell__value u-color-red">${data.sells} (${data.sellAmount.toFixed(2)} SOL)</div>
                </div>
              </div>
            </div>
            <div class="l-row l-row-gap--4xs u-mt-3xs">
              <div class="l-col js-info__line__green" style="flex: 0 0 ${(data.buyAmount / totalVolume * 100).toFixed(2)}%;">
                <div class="c-info__line c-info__line--green"></div>
              </div>
              <div class="l-col js-info__line__red" style="flex: 0 0 ${(data.sellAmount / totalVolume * 100).toFixed(2)}%;">
                <div class="c-info__line"></div>
              </div>
            </div>
            <div class="l-row" style="margin-top: 5px;">
              <div class="l-col">
                <small style="font-size: 10px" class="${threat.class}">${threat.message}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};