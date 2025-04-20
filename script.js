document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements ---
    const balanceForm = document.getElementById('balance-form');
    const riskForm = document.getElementById('risk-form');
    const balanceResultsDiv = document.getElementById('balance-results');
    const riskResultsDiv = document.getElementById('risk-results');

    // --- Get Elements for Balance Calculator Input Type --- START
    const inputTypeBaseRadio = document.getElementById('input-type-base');
    const inputTypeQuoteRadio = document.getElementById('input-type-quote');
    const posSizeBaseInput = document.getElementById('pos-size-bal');
    const posSizeQuoteInput = document.getElementById('pos-size-quote');
    const posSizeBaseGroup = document.getElementById('pos-size-base-group');
    const posSizeQuoteGroup = document.getElementById('pos-size-quote-group');
    // --- Get Elements for Balance Calculator Input Type --- END

    // --- Get Elements for Risk Calculator Input Type --- START
    const riskInputTypeAmountRadio = document.getElementById('risk-input-type-amount');
    const riskInputTypePercentRadio = document.getElementById('risk-input-type-percent');
    const riskAmountGroup = document.getElementById('risk-amount-group');
    const riskPercentInputsGroup = document.getElementById('risk-percent-inputs-group');
    const riskAmountInput = document.getElementById('risk-amount'); // Already exists, just listing here
    const accountBalanceInput = document.getElementById('account-balance');
    const riskPercentInput = document.getElementById('risk-percent');
    // --- Get Elements for Risk Calculator Input Type --- END

    // --- Helper Function to Display Results ---
    function displayResults(element, content) {
        element.innerHTML = content;
    }

    // --- Theme Toggler --- START

    const themeToggleButton = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Function to set the theme and update button text
    const setTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleButton.textContent = 'Light Mode ☀️';
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleButton.textContent = 'Dark Mode 🌙';
            localStorage.setItem('theme', 'light'); // Explicitly set light
        }
    }

    // Apply the saved theme on initial load
    if (currentTheme) {
        setTheme(currentTheme);
    } else {
        // Optional: Check system preference if no theme is saved
        // const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        // setTheme(prefersDark ? 'dark' : 'light');
        // Or just default to light:
        setTheme('light');
    }

    // Add event listener for the toggle button
    themeToggleButton.addEventListener('click', () => {
        // Check current state by looking at the body class
        const isDarkMode = document.body.classList.contains('dark-mode');
        setTheme(isDarkMode ? 'light' : 'dark'); // Toggle to the opposite
    });

    // --- Theme Toggler --- END

    // --- Existing Calculator Logic Below ---
    // ... (keep all your calculator code: get elements, toggles, form listeners) ...

    // --- Toggle Balance Calculator Input Fields --- START
    function toggleBalanceInputFields() {
        if (inputTypeBaseRadio.checked) {
            posSizeBaseGroup.style.display = 'block';
            posSizeQuoteGroup.style.display = 'none';
            posSizeBaseInput.required = true; // Make base input required
            posSizeQuoteInput.required = false; // Make quote input not required
            posSizeQuoteInput.value = ''; // Clear the other field
            posSizeBaseGroup.classList.remove('disabled');
            posSizeQuoteGroup.classList.add('disabled');

        } else { // Quote input selected
            posSizeBaseGroup.style.display = 'none';
            posSizeQuoteGroup.style.display = 'block';
            posSizeBaseInput.required = false; // Make base input not required
            posSizeQuoteInput.required = true; // Make quote input required
            posSizeBaseInput.value = ''; // Clear the other field
            posSizeBaseGroup.classList.add('disabled');
            posSizeQuoteGroup.classList.remove('disabled');
        }
    }

    // --- Toggle Risk Calculator Input Fields --- START
    function toggleRiskInputFields() {
        if (riskInputTypeAmountRadio.checked) {
            riskAmountGroup.style.display = 'block';
            riskPercentInputsGroup.style.display = 'none';
            riskAmountInput.required = true;
            accountBalanceInput.required = false;
            riskPercentInput.required = false;
            accountBalanceInput.value = ''; // Clear hidden fields
            riskPercentInput.value = '';    // Clear hidden fields
            riskAmountGroup.classList.remove('disabled');
            riskPercentInputsGroup.classList.add('disabled');
        } else { // Percent input selected
            riskAmountGroup.style.display = 'none';
            riskPercentInputsGroup.style.display = 'flex';
            riskAmountInput.required = false;
            accountBalanceInput.required = true;
            riskPercentInput.required = true;
            riskAmountInput.value = '';    // Clear hidden field
            riskAmountGroup.classList.add('disabled');
            riskPercentInputsGroup.classList.remove('disabled');
        }
    }

    // Add event listeners to radio buttons
    inputTypeBaseRadio.addEventListener('change', toggleBalanceInputFields);
    inputTypeQuoteRadio.addEventListener('change', toggleBalanceInputFields);

    // Add event listeners to Risk Calc radio buttons
    riskInputTypeAmountRadio.addEventListener('change', toggleRiskInputFields);
    riskInputTypePercentRadio.addEventListener('change', toggleRiskInputFields);

    // Initial call to set the correct state on page load
    toggleBalanceInputFields();
    // --- Toggle Balance Calculator Input Fields --- END

    // Initial call for Risk Calc toggler
    toggleRiskInputFields();
    // --- Toggle Risk Calculator Input Fields --- END

    // --- Balance Calculator Logic ---
    balanceForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent page reload
        balanceResultsDiv.innerHTML = ''; // Clear previous results

        try {
            // --- Read values based on selected input type --- START
            const entryPrice = parseFloat(document.getElementById('entry-price-bal').value);
            const liqPrice = parseFloat(document.getElementById('liq-price-bal').value);
            let posSizeBase; // Will hold the position size in BASE asset (e.g., BTC)

            if (isNaN(entryPrice) || isNaN(liqPrice)) {
                 throw new Error("Please enter valid numbers for Entry and Liquidation prices.");
            }
             if (entryPrice <= 0) {
                 throw new Error("Entry Price must be greater than zero.");
             }
             if (entryPrice === liqPrice) {
                 throw new Error("Entry Price and Liquidation Price cannot be the same.");
             }

            const priceDifference = Math.abs(entryPrice - liqPrice);

            if (inputTypeBaseRadio.checked) {
                posSizeBase = parseFloat(posSizeBaseInput.value);
                if (isNaN(posSizeBase) || posSizeBase <= 0) {
                    throw new Error("Please enter a valid Position Size (Quantity) greater than zero.");
                }
            } else { // Quote input selected
                const posSizeQuote = parseFloat(posSizeQuoteInput.value);
                 if (isNaN(posSizeQuote) || posSizeQuote <= 0) {
                    throw new Error("Please enter a valid Position Size (Quote Value $) greater than zero.");
                }
                // Convert Quote Size ($) to Base Size (e.g., BTC)
                posSizeBase = posSizeQuote / entryPrice;
                 if (!isFinite(posSizeBase) || posSizeBase <= 0) {
                     throw new Error("Calculated base position size is invalid. Check inputs.");
                 }
            }
            // --- Read values based on selected input type --- END


            // Calculation (Simplified: Margin = BaseSize * Price Difference to Liquidation)
            const estimatedMarginRequired = posSizeBase * priceDifference;

            // Display Results
             displayResults(balanceResultsDiv, `
                <p><strong>Estimated Account Balance:</strong> $${estimatedMarginRequired.toFixed(2)}</p> 
                <hr class="results-divider">
                <p><strong>Quantity:</strong> ${posSizeBase.toFixed(6)}</p>
            `);
        } catch (error) {
            displayResults(balanceResultsDiv, `<p class="error">Error: ${error.message}</p>`);
        }
    });

 // --- Risk Calculator Logic --- (MODIFIED)
 riskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent page reload
    riskResultsDiv.innerHTML = ''; // Clear previous results

    try {
        // --- Determine Risk Amount --- START
        let riskAmount;
        let riskInputMethodUsed = 'amount'; // Track method for potential display changes

        if (riskInputTypeAmountRadio.checked) {
            riskAmount = parseFloat(riskAmountInput.value);
            if (isNaN(riskAmount) || riskAmount <= 0) {
                throw new Error("Please enter a valid Amount to Risk greater than zero.");
            }
        } else { // Percent input selected
            riskInputMethodUsed = 'percent';
            const accountBalance = parseFloat(accountBalanceInput.value);
            const riskPercent = parseFloat(riskPercentInput.value);

            if (isNaN(accountBalance) || accountBalance <= 0) {
                throw new Error("Please enter a valid Account Balance greater than zero.");
            }
            if (isNaN(riskPercent) || riskPercent <= 0 || riskPercent > 100) {
                 throw new Error("Please enter a valid Risk Percentage between 0 and 100.");
            }

            riskAmount = accountBalance * (riskPercent / 100);
             if (riskAmount <= 0 || !isFinite(riskAmount)) { // Double check calculated amount
                 throw new Error("Calculated Risk Amount is invalid. Check Balance and Percentage.");
             }
        }
        // --- Determine Risk Amount --- END
        

        // --- Read other inputs ---
        const accountBalance = parseFloat(document.getElementById('account-balance').value);
        const entryPrice = parseFloat(document.getElementById('entry-price-risk').value);
        const tpPrice = parseFloat(document.getElementById('tp-price').value);
        const slPrice = parseFloat(document.getElementById('sl-price').value);
        const leverage = parseFloat(document.getElementById('leverage').value);

        // --- Validation for other inputs ---
        if (isNaN(entryPrice) || isNaN(tpPrice) || isNaN(slPrice) || isNaN(leverage)) {
            throw new Error("Please enter valid numbers for Entry, TP, SL, and Leverage.");
        }
        if (entryPrice <= 0) {
            throw new Error("Entry price must be greater than zero.");
        }
        if (leverage < 1) {
            throw new Error("Leverage must be 1 or greater.");
        }
        if (entryPrice === slPrice) {
            throw new Error("Entry Price and Stop Loss Price cannot be the same.");
        }
         if (entryPrice === tpPrice) {
            throw new Error("Entry Price and Take Profit Price cannot be the same.");
        }

        // --- Determine Long/Short and validate SL/TP placement ---
        let isLong = tpPrice > entryPrice;
        if (isLong) {
            if (slPrice >= entryPrice) throw new Error("For a Long trade, Stop Loss must be below Entry Price.");
             if (tpPrice <= entryPrice) throw new Error("For a Long trade, Take Profit must be above Entry Price.");
        } else { // isShort
             if (tpPrice >= entryPrice) throw new Error("For a Short trade, Take Profit must be below Entry Price.");
             if (slPrice <= entryPrice) throw new Error("For a Short trade, Stop Loss must be above Entry Price.");
        }

        // --- Calculations (using the determined riskAmount) ---
        const slDistance = Math.abs(entryPrice - slPrice);
        if (slDistance === 0) {
             throw new Error("Stop Loss distance cannot be zero.");
        }

        const positionSizeBase = riskAmount / slDistance; // Quantity
        const positionSizeQuote = positionSizeBase * entryPrice; // USDT value
        const requiredMargin = positionSizeQuote / leverage;

        const tpDistance = Math.abs(tpPrice - entryPrice);
        const expectedProfit = positionSizeBase * tpDistance;
        const expectedLoss = riskAmount; // By definition

        const riskRewardRatio = (expectedLoss > 0) ? (expectedProfit / expectedLoss) : Infinity;

        // Calculate Percentages (ROE - Return on Equity based on margin used)
        const lossPercentage = (requiredMargin > 0) ? (expectedLoss / requiredMargin) * 100 : 0;
        const profitPercentage = (requiredMargin > 0) ? (expectedProfit / requiredMargin) * 100 : 0;

        //NEWCALC
        const percentageOfAvailableAmount = (requiredMargin / accountBalance) * 100;
    

        // --- Display Results ---
         displayResults(riskResultsDiv, `
            <p><strong>Trade Direction:</strong> ${isLong ? '🟢 Long' : '🔴 Short'}</p>
            <p><strong>Leverage:</strong> ${leverage}x</p>
            <p style="color: var(--success-color);"><strong>Expected Profit:</strong> $${expectedProfit.toFixed(2)} (+${profitPercentage.toFixed(2)}%)</p>
            <p style="color: var(--danger-color);"><strong>Expected Loss:</strong> -$${expectedLoss.toFixed(2)} (-${lossPercentage.toFixed(2)}%)</p>
            <p><strong>RR Ratio:</strong> 1 : ${isFinite(riskRewardRatio) ? riskRewardRatio.toFixed(2) : 'N/A'}</p>
            <hr class="results-divider">
            <p><strong>Quantity:</strong> ${positionSizeBase.toFixed(6)}</p>
            <p><strong>Position Size (USDT):</strong> ${positionSizeQuote.toFixed(2)}</p>
            <p><strong>Required Margin:</strong> $${requiredMargin.toFixed(2)}</p>
            ${riskInputMethodUsed === 'percent' ? `<hr class="results-divider">` : ''}
            ${riskInputMethodUsed === 'percent' ? `<p>${percentageOfAvailableAmount.toFixed(0)}% of available amount</p>` : ''}
         `);

    } catch (error) {
         displayResults(riskResultsDiv, `<p class="error">Error: ${error.message}</p>`);
    }
});

 // --- Get Elements for PnL Calculator --- START (MODIFIED)
 const pnlForm = document.getElementById('pnl-form');
 const pnlResultsDiv = document.getElementById('pnl-results');
 const pnlInputTypeBaseRadio = document.getElementById('pnl-input-type-base');
 const pnlInputTypeQuoteRadio = document.getElementById('pnl-input-type-quote');
 const pnlInputTypeMarginRadio = document.getElementById('pnl-input-type-margin');
 const pnlInputTypeBalPercentRadio = document.getElementById('pnl-input-type-balpercent');

 const pnlPosSizeBaseGroup = document.getElementById('pnl-pos-size-base-group');
 const pnlPosSizeQuoteGroup = document.getElementById('pnl-pos-size-quote-group');
 const pnlPosSizeMarginGroup = document.getElementById('pnl-pos-size-margin-group');
 const pnlBalPercentGroup = document.getElementById('pnl-balpercent-group');

 const pnlPosSizeBaseInput = document.getElementById('pnl-pos-size-base');
 const pnlPosSizeQuoteInput = document.getElementById('pnl-pos-size-quote');
 const pnlMarginAmountInput = document.getElementById('pnl-margin-amount');
 // Removed pnlLeverageInput (specific to margin group)
 const pnlAccountBalanceInput = document.getElementById('pnl-account-balance');
 const pnlMarginPercentInput = document.getElementById('pnl-margin-percent');
 // Removed pnlBalPercentLeverageInput (specific to balpercent group)

 const pnlLeverageMainInput = document.getElementById('pnl-leverage-main'); // Added reference to main leverage input
 // --- Get Elements for PnL Calculator --- END

 // ... (Keep other element getters, helper functions, theme toggler) ...

 // --- Toggle PnL Calculator Input Fields --- START (MODIFIED)
 function togglePnlInputFields() {
     const groups = [pnlPosSizeBaseGroup, pnlPosSizeQuoteGroup, pnlPosSizeMarginGroup, pnlBalPercentGroup];
     // Updated inputs array - removed specific leverage inputs
     const inputs = [
         [pnlPosSizeBaseInput],                              // Base group (Index 0)
         [pnlPosSizeQuoteInput],                             // Quote group (Index 1)
         [pnlMarginAmountInput],                             // Margin group (Index 2) - only margin amount now
         [pnlAccountBalanceInput, pnlMarginPercentInput]     // BalPercent group (Index 3) - only balance and percent now
     ];

     let activeGroupIndex = 0; // Default to Base
     if (pnlInputTypeQuoteRadio.checked) activeGroupIndex = 1;
     else if (pnlInputTypeMarginRadio.checked) activeGroupIndex = 2;
     else if (pnlInputTypeBalPercentRadio.checked) activeGroupIndex = 3;

     groups.forEach((group, index) => {
         const isActive = index === activeGroupIndex;

         if (isActive) {
              // Use flex only for BalPercent group (index 3) as it's the only one with multiple side-by-side inputs left
             group.style.display = (index === 3) ? 'flex' : 'block';
             group.classList.remove('disabled');
         } else {
             group.style.display = 'none'; // Hide inactive groups
             group.classList.add('disabled');
         }

         // Manage required attribute and clear hidden inputs
         inputs[index].forEach(input => {
             input.required = isActive;
             if (!isActive) {
                 input.value = ''; // Clear value when hidden
             }
         });
     });

     // Also ensure the main leverage input is never disabled (optional step)
     pnlLeverageMainInput.disabled = false;
     pnlLeverageMainInput.closest('.input-group').classList.remove('disabled'); // Ensure parent isn't disabled visually
 }

 // Add event listeners to PnL radio buttons (no changes here)
 pnlInputTypeBaseRadio.addEventListener('change', togglePnlInputFields);
 pnlInputTypeQuoteRadio.addEventListener('change', togglePnlInputFields);
 pnlInputTypeMarginRadio.addEventListener('change', togglePnlInputFields);
 pnlInputTypeBalPercentRadio.addEventListener('change', togglePnlInputFields);

 // Initial call for PnL calculator (no changes here)
 togglePnlInputFields();
 // --- Toggle PnL Calculator Input Fields --- END

 // ... (Keep toggle functions for Balance and Risk Calcs) ...
 // ... (Keep Balance Calculator Logic) ...
 // ... (Keep Risk Calculator Logic) ...


 // --- PnL & R:R Calculator Logic --- START (MODIFIED)
 pnlForm.addEventListener('submit', (e) => {
     e.preventDefault();
     pnlResultsDiv.innerHTML = '';

     try {
         // Read common inputs
         const entryPrice = parseFloat(document.getElementById('entry-price-pnl').value);
         const tpPrice = parseFloat(document.getElementById('tp-price-pnl').value);
         const slPrice = parseFloat(document.getElementById('sl-price-pnl').value);

         // ** Read Main Leverage Input (Always) and Handle Default **
         let inputLeverage = parseFloat(pnlLeverageMainInput.value);
         if (isNaN(inputLeverage) || inputLeverage < 1) {
             inputLeverage = 1; // Default to 1x if empty or invalid
         }

          // Basic validation for common inputs
         if (isNaN(entryPrice) || isNaN(tpPrice) || isNaN(slPrice)) {
             throw new Error("Please enter valid numbers for Entry, TP, and SL prices.");
         }
         if (entryPrice <= 0) throw new Error("Entry Price must be greater than zero.");
         if (entryPrice === slPrice) throw new Error("Entry Price and Stop Loss Price cannot be the same.");
         if (entryPrice === tpPrice) throw new Error("Entry Price and Take Profit Price cannot be the same.");

         let positionSizeBase; // Quantity
         let positionValueQuote; // USDT value of position
         let marginUsed = null; // USDT amount used as margin (null if not calculated/specified)
         let calculationMode = 'base';

         // Determine Position Size based on selected input type
         if (pnlInputTypeBaseRadio.checked) {
             calculationMode = 'base';
             positionSizeBase = parseFloat(pnlPosSizeBaseInput.value);
             if (isNaN(positionSizeBase) || positionSizeBase <= 0) throw new Error("Please enter a valid Quantity greater than zero.");
             positionValueQuote = positionSizeBase * entryPrice;

         } else if (pnlInputTypeQuoteRadio.checked) {
             calculationMode = 'quote';
             positionValueQuote = parseFloat(pnlPosSizeQuoteInput.value);
             if (isNaN(positionValueQuote) || positionValueQuote <= 0) throw new Error("Please enter a valid Position Size (USDT) greater than zero.");
             positionSizeBase = positionValueQuote / entryPrice;
             if (!isFinite(positionSizeBase) || positionSizeBase <= 0) throw new Error("Calculated quantity is invalid. Check inputs.");

         } else if (pnlInputTypeMarginRadio.checked) {
             calculationMode = 'margin';
             marginUsed = parseFloat(pnlMarginAmountInput.value); // Read only margin here
             if (isNaN(marginUsed) || marginUsed <= 0) throw new Error("Please enter a valid Margin Amount greater than zero.");
             // Leverage is read from the main input above

             positionValueQuote = marginUsed * inputLeverage; // Use main leverage
             positionSizeBase = positionValueQuote / entryPrice;
             if (!isFinite(positionSizeBase) || positionSizeBase <= 0) throw new Error("Calculated quantity is invalid. Check inputs.");

         } else if (pnlInputTypeBalPercentRadio.checked) {
              calculationMode = 'balpercent';
              const accountBalance = parseFloat(pnlAccountBalanceInput.value);
              const marginPercent = parseFloat(pnlMarginPercentInput.value);
              // Leverage is read from the main input above

              if (isNaN(accountBalance) || accountBalance <= 0) throw new Error("Please enter a valid Account Balance greater than zero.");
              if (isNaN(marginPercent) || marginPercent <= 0 || marginPercent > 100) throw new Error("Please enter a valid Margin Used Percentage between 0 and 100.");

              marginUsed = accountBalance * (marginPercent / 100);
              if (marginUsed <= 0 || !isFinite(marginUsed)) throw new Error("Calculated Margin Amount is invalid. Check Balance and Percentage.");

              positionValueQuote = marginUsed * inputLeverage; // Use main leverage
              positionSizeBase = positionValueQuote / entryPrice;
              if (!isFinite(positionSizeBase) || positionSizeBase <= 0) throw new Error("Calculated quantity is invalid. Check inputs.");
         }

         // Determine Long/Short and validate SL/TP placement
         let isLong = tpPrice > entryPrice;
         // (Validation logic remains the same)
         if (isLong) {
             if (slPrice >= entryPrice) throw new Error("For a Long trade, Stop Loss must be below Entry Price.");
             if (tpPrice <= entryPrice) throw new Error("For a Long trade, Take Profit must be above Entry Price.");
         } else { // isShort
              if (tpPrice >= entryPrice) throw new Error("For a Short trade, Take Profit must be below Entry Price.");
              if (slPrice <= entryPrice) throw new Error("For a Short trade, Stop Loss must be above Entry Price.");
         }

         // Calculate PnL amounts
         const slDistance = Math.abs(entryPrice - slPrice);
         const tpDistance = Math.abs(tpPrice - entryPrice);
         const lossAtSl = positionSizeBase * slDistance;
         const profitAtTp = positionSizeBase * tpDistance;

         // ** Calculate Required Margin (Always) **
         const requiredMargin = (inputLeverage > 0) ? positionValueQuote / inputLeverage : positionValueQuote;

         // Calculate Percentages (Default ROI, switch to ROE if margin was specified/calculated)
         let lossPercentage = (positionValueQuote > 0) ? (lossAtSl / positionValueQuote) * 100 : 0;
         let profitPercentage = (positionValueQuote > 0) ? (profitAtTp / positionValueQuote) * 100 : 0;

         // Calculate R:R Ratio
         const riskRewardRatio = (lossAtSl > 0) ? (profitAtTp / lossAtSl) : Infinity;

         // Read Balance Percentage
         const marginPercent = parseFloat(document.getElementById('pnl-margin-percent').value);

         // Display Results (MODIFIED)
         displayResults(pnlResultsDiv, `
             <p><strong>Trade Direction:</strong> ${isLong ? '🟢 Long' : '🔴 Short'}</p>
             <p><strong>Leverage:</strong> ${inputLeverage}x</p> <!-- Always show leverage -->
             <p style="color: var(--success-color);"><strong>Expected Profit:</strong> $${profitAtTp.toFixed(2)} (+${(profitPercentage * inputLeverage).toFixed(2)}%)</p>
             <p style="color: var(--danger-color);"><strong>Expected Loss:</strong> -$${lossAtSl.toFixed(2)} (-${(lossPercentage * inputLeverage).toFixed(2)}%)</p>
             <p><strong>RR Ratio:</strong> 1 : ${isFinite(riskRewardRatio) ? riskRewardRatio.toFixed(2) : 'N/A'}</p>
             <hr class="results-divider">
             <p><strong>Quantity:</strong> ${positionSizeBase.toFixed(6)}</p>
             <p><strong>Position Size (USDT):</strong> ${positionValueQuote.toFixed(2)}</p>
             <p><strong>Margin:</strong> $${requiredMargin.toFixed(2)}</p> <!-- Always show margin -->
             ${calculationMode == 'balpercent' ? `<hr class="results-divider">` : ''}
             ${calculationMode == 'balpercent' ? `<p> ${marginPercent}% of available amount</p>` : ''}
         `);

     } catch (error) {
         displayResults(pnlResultsDiv, `<p class="error">Error: ${error.message}</p>`);
     }
 });
 // --- PnL & R:R Calculator Logic --- END

}); // End DOMContentLoaded

