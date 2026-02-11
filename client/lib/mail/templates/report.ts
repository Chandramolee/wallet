
export const getReportEmailTemplate = (
    reportData: any,
    frequency: string
) => {
    const {
        username,
        period,
        totalIncome,
        totalExpenses,
        availableBalance,
        savingsRate,
        topSpendingCategories,
        insights,
    } = reportData;

    const reportTitle = `${frequency.charAt(0).toUpperCase() + frequency.slice(1).toLowerCase()} Report`;

    const categoryList = topSpendingCategories
        ?.map(
            (cat: any) => `<li>
      ${cat.name} - ₹${cat.amount.toLocaleString()} (${cat.percent}%)
      </li>
    `
        )
        .join("") || "";

    const insightsList = insights
        ?.map((insight: string) => `<li>${insight}</li>`)
        .join("") || "";

    return `
  <!DOCTYPE html>
 <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <title>${reportTitle}</title>
     <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
   </head>
   <body style="margin: 0; padding: 0; font-family: 'Roboto', Arial, sans-serif; background-color: #f7f7f7; font-size: 16px;">
     <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f7f7f7; padding: 20px;">
       <tr>
         <td>
           <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
             <tr>
               <td style="background-color: #00bc7d; padding: 20px 30px; color: #ffffff; text-align: center;">
                 <h2 style="margin: 0; font-size: 24px; text-transform: capitalize">${reportTitle}</h2>
               </td>
             </tr>
             <tr>
               <td style="padding: 20px 30px;">
                 <p style="margin: 0 0 10px; font-size: 16px;">Hi <strong>${username}</strong>,</p>
                 <p style="margin: 0 0 20px; font-size: 16px;">Here's your financial summary for <strong>${period}</strong>.</p>
 
                 <table width="100%" style="border-collapse: collapse;">
                   <tr>
                     <td style="padding: 8px 0; font-size: 16px;"><strong>Total Income:</strong></td>
                     <td style="text-align: right; font-size: 16px;">₹${totalIncome.toLocaleString()}</td>
                   </tr>
                   <tr>
                     <td style="padding: 8px 0; font-size: 16px;"><strong>Total Expenses:</strong></td>
                     <td style="text-align: right; font-size: 16px;">₹${totalExpenses.toLocaleString()}</td>
                   </tr>
                   <tr>
                     <td style="padding: 8px 0; font-size: 16px;"><strong>Available Balance:</strong></td>
                     <td style="text-align: right; font-size: 16px;">₹${availableBalance.toLocaleString()}</td>
                   </tr>
                   <tr>
                     <td style="padding: 8px 0; font-size: 16px;"><strong>Savings Rate:</strong></td>
                     <td style="text-align: right; font-size: 16px;">${savingsRate.toFixed(2)}%</td>
                   </tr>
                 </table>
 
                 <h3 style="margin: 30px 0 10px; font-size: 18px; border-bottom: 2px solid #f7f7f7; padding-bottom: 5px;">Top Spending Categories</h3>
                 <ul style="margin: 0; padding: 0 20px; font-size: 16px;">
                   ${categoryList}
                 </ul>
 
                 <h3 style="margin: 30px 0 10px; font-size: 18px; border-bottom: 2px solid #f7f7f7; padding-bottom: 5px;">AI Insights</h3>
                 <ul style="margin: 0; padding: 0 20px; font-size: 16px; color: #555;">
                   ${insightsList}
                 </ul>
 
                 <p style="margin: 30px 0 0; font-size: 14px; color: #888; text-align: center;">
                   Keep track of your spending and reach your financial goals with Finora!
                 </p>
               </td>
             </tr>
             <tr>
               <td style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #aaa;">
                 &copy; ${new Date().getFullYear()} Finora. All rights reserved.
               </td>
             </tr>
           </table>
         </td>
       </tr>
     </table>
   </body>
 </html>
  `;
};
