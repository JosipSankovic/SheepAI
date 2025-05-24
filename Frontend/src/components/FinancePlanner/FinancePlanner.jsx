import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import './FinancePlanner.css';

const capitalize = (s) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const FinancePlanner = () => {
  const [activeTab, setActiveTab] = useState('budget');

  const [budget, setBudget] = useState(() => {
    try {
      const storedBudget = JSON.parse(localStorage.getItem('budget'));
      return storedBudget || {
        monthlyIncome: 0,
        hrana: 500,
        stanarina: 800,
        prijevoz: 150,
        zabava: 200,
        štednja: 300,
        ostalo: 100,
        kredit:0,
      };
    } catch (e) {
      console.error("Failed to parse budget from localStorage:", e);
      return {
        monthlyIncome: 0,
        // Prevedene kategorije na hrvatski
        hrana: 500,
        stanarina: 800,
        prijevoz: 150,
        zabava: 200,
        štednja: 300,
        ostalo: 100,
        kredit:0,
      };
    }
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [budgetNotifications, setBudgetNotifications] = useState([]);

  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('transactions')) || [];
    } catch (e) {
      console.error("Failed to parse transactions from localStorage:", e);
      return [];
    }
  });
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    type: 'expense',
    subtype: 'variable',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState({
    type: 'all',
    category: 'all',
    startDate: '',
    endDate: ''
  });

  const [goals, setGoals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('goals')) || [];
    } catch (e) {
      console.error("Failed to parse goals from localStorage:", e);
      return [];
    }
  });
  const [newGoal, setNewGoal] = useState({
    name: '',
    targetAmount: '',
    savedAmount: '',
    dueDate: '',
    monthlyContribution: ''
  });

  const PIE_COLORS = ['#64ffda', '#6c63ff', '#ffa500', '#ff6347', '#32cd32', '#8a2be2', '#00ced1', '#ffc658', '#a4de6c'];

  const categoryIcons = {
    hrana: 'fa-utensils',
    stanarina: 'fa-house',
    prijevoz: 'fa-car',
    zabava: 'fa-film',
    štednja: 'fa-piggy-bank',
    ostalo: 'fa-ellipsis-h',
    monthlyIncome: 'fa-sack-dollar'
  };

  useEffect(() => {
    localStorage.setItem('budget', JSON.stringify(budget));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [budget, transactions, goals]);

  useEffect(() => {
    const currentExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const newNotifications = [];
    for (const category in budget) {
      if (category === 'monthlyIncome') continue;
      const spent = currentExpenses[category] || 0;
      const allocated = budget[category];
      if (allocated > 0 && spent >= allocated * 0.9) {
        newNotifications.push({
          category: capitalize(category),
          message: `Pažnja! Potrošnja za ${capitalize(category)} je blizu ili je prešla ${allocated}€ (${(spent / allocated * 100).toFixed(0)}% budžeta).`,
          type: spent >= allocated ? 'danger' : 'warning',
        });
      }
    }
    setBudgetNotifications(newNotifications);

    const filtered = transactions.filter(t => {
      const matchType = filter.type === 'all' || t.type === filter.type;
      const matchCategory = filter.category === 'all' || t.category === filter.category;
      const transactionDate = new Date(t.date);
      const matchStartDate = filter.startDate ? transactionDate >= new Date(filter.startDate) : true;
      const matchEndDate = filter.endDate ? transactionDate <= new Date(filter.endDate) : true;
      return matchType && matchCategory && matchStartDate && matchEndDate;
    });
    setFilteredTransactions(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  }, [budget, transactions, filter]);

  const handleBudgetChange = (category, value) => {
    setBudget(prevBudget => ({
      ...prevBudget,
      [category]: parseFloat(value) || 0,
    }));
  };

  const addCustomCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName === '' || budget.hasOwnProperty(trimmedName.toLowerCase())) {
      alert('Kategorija je prazna ili već postoji.');
      return;
    }
    setBudget(prevBudget => ({
      ...prevBudget,
      [trimmedName.toLowerCase()]: 0,
    }));
    setNewCategoryName('');
  };

  const getBudgetDataForChart = () => {
    const expenseCategories = Object.keys(budget).filter(cat => cat !== 'monthlyIncome');
    return expenseCategories.map((category, index) => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === category && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const allocated = budget[category] || 0;
      return {
        name: capitalize(category),
        value: allocated,
        spent: spent,
        remaining: allocated - spent,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      };
    });
  };

  const getProgressBarData = () => {
    const currentExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const expenseCategories = Object.keys(budget).filter(cat => cat !== 'monthlyIncome');
    return expenseCategories.map((category, index) => {
      const spent = currentExpenses[category] || 0;
      const allocated = budget[category] || 0;
      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
      return {
        name: capitalize(category),
        spent: spent,
        allocated: allocated,
        percentage: Math.min(percentage, 100)
      };
    });
  };

  const calculateBudgetBalance = () => {
    const totalAllocatedExpenses = Object.keys(budget)
      .filter(cat => cat !== 'monthlyIncome')
      .reduce((sum, cat) => sum + budget[cat], 0);
    return budget.monthlyIncome - totalAllocatedExpenses;
  };

  const handleTransactionChange = (e) => {
    setNewTransaction({ ...newTransaction, [e.target.name]: e.target.value });
  };

  const addTransaction = (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.date) {
      alert('Molimo popunite sva obavezna polja za transakciju.');
      return;
    }
    const transactionToAdd = {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount),
    };
    setTransactions(prev => [...prev, transactionToAdd]);
    setNewTransaction({
      amount: '',
      category: '',
      type: 'expense',
      subtype: 'variable',
      date: new Date().toISOString().split('T')[0],
      description: ''
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getCategoriesForTransactions = () => {
    const categories = new Set();
    transactions.forEach(t => categories.add(t.category));
    Object.keys(budget).filter(cat => cat !== 'monthlyIncome').forEach(cat => categories.add(cat));
    return Array.from(categories);
  };


  const getExpenseDataByCategories = () => {
    const expenseData = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    return Object.keys(expenseData).map((category, index) => ({
      name: capitalize(category),
      value: expenseData[category],
      fill: PIE_COLORS[index % PIE_COLORS.length],
    }));
  };

  const getMonthlyComparisonData = () => {
    const monthlyData = {};
    transactions.forEach(t => {
      const monthYear = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        monthlyData[monthYear].income += t.amount;
      } else {
        monthlyData[monthYear].expenses += t.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const dateA = new Date(a.replace(' ', ' 1, '));
      const dateB = new Date(b.replace(' ', ' 1, '));
      return dateA - dateB;
    });

    return sortedMonths.map(month => ({
      name: month,
      Prihodi: monthlyData[month].income,
      Rashodi: monthlyData[month].expenses,
    }));
  };

  const handleGoalChange = (e) => {
    setNewGoal({ ...newGoal, [e.target.name]: e.target.value });
  };

  const addGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.dueDate) {
      alert('Molimo popunite sva obavezna polja za cilj.');
      return;
    }
    const goalToAdd = {
      ...newGoal,
      id: Date.now(),
      targetAmount: parseFloat(newGoal.targetAmount),
      savedAmount: parseFloat(newGoal.savedAmount) || 0,
      monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
    };
    setGoals(prev => [...prev, goalToAdd]);
    setNewGoal({ name: '', targetAmount: '', savedAmount: '', dueDate: '', monthlyContribution: '' });
  };

  const updateGoalSavedAmount = (id, amount) => {
    setGoals(prev => prev.map(goal =>
      goal.id === id ? { ...goal, savedAmount: goal.savedAmount + parseFloat(amount) } : goal
    ));
  };

  const generateFinancialTips = () => {
    const tips = [];
    const currentMonthExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const totalAllocatedExpenses = Object.keys(budget)
      .filter(cat => cat !== 'monthlyIncome')
      .reduce((sum, cat) => sum + budget[cat], 0);

    const actualMonthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === new Date().getMonth())
      .reduce((sum, t) => sum + t.amount, 0);

    const actualMonthlyExpenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + t.amount, 0);

    const actualNetBalance = actualMonthlyIncome - actualMonthlyExpenses;


    if (budget.monthlyIncome < totalAllocatedExpenses) {
      tips.push(`Upozorenje: Vaša **planirana** mjesečna potrošnja (${totalAllocatedExpenses.toFixed(2)}€) opasno prelazi vaša mjesečna primanja (${budget.monthlyIncome.toFixed(2)}€)! Potrebno je hitno revidirati budžet i smanjiti izdatke!`);
    } else if (budget.monthlyIncome > 0 && calculateBudgetBalance() > 0) {
        tips.push(`Odlično! Vaš budžet ima planirani višak od ${calculateBudgetBalance().toFixed(2)}€. Razmislite o usmjeravanju ovog viška prema štednji ili ciljevima.`);
    }

    for (const category in budget) {
      if (category === 'monthlyIncome') continue;
      const spent = currentMonthExpenses[category] || 0;
      const allocated = budget[category];
      if (allocated > 0 && spent > allocated) {
        tips.push(`Upozorenje: Prekoračili ste budžet za **${capitalize(category)}** za ${((spent - allocated)).toFixed(2)}€! Razmislite o smanjenju potrošnje u ovoj kategoriji.`);
      } else if (allocated > 0 && spent / allocated > 0.8) {
        tips.push(`Savjet: Potrošnja za **${capitalize(category)}** je ${((spent / allocated) * 100).toFixed(0)}% vašeg budžeta. Možda možete pronaći način da uštedite u ovoj kategoriji?`);
      }
    }

    if (actualNetBalance < 0) {
      tips.push(`Alarmantno: Vaš **stvarni** mjesečni rashod (${actualMonthlyExpenses.toFixed(2)}€) je drastično veći od prihoda (${actualMonthlyIncome.toFixed(2)}€)! Nalazite se u ozbiljnom financijskom manjku. Hitno smanjite potrošnju ili pronađite nove izvore prihoda.`);
    } else if (actualNetBalance > 0 && budget.štednja > 0 && actualNetBalance < budget.štednja) {
      tips.push(`Odlično! Imate mjesečni višak. Razmislite o povećanju iznosa za štednju kako biste brže ostvarili ciljeve.`);
    } else if (actualNetBalance > 0 && budget.štednja === 0) {
        tips.push(`Imate mjesečni višak! Jeste li razmišljali o postavljanju cilja štednje?`);
    }

    if (tips.length === 0) {
      tips.push("Trenutno nemamo specifičnih savjeta. Vaše financije su dobro uravnotežene!");
    }
    return tips;
  };

  const getMonthlyDeficitMessage = () => {
    const totalAllocatedExpenses = Object.keys(budget)
      .filter(cat => cat !== 'monthlyIncome')
      .reduce((sum, cat) => sum + budget[cat], 0);
    const monthlyBalance = budget.monthlyIncome - totalAllocatedExpenses;

    if (monthlyBalance < 0) {
      return `Vaš **mjesečni** manjak iznosi: **${Math.abs(monthlyBalance).toFixed(2)}€**.`;
    } else {
      return null; // Nema manjka
    }
  };


  const getAnnualOutlook = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    const currentDayOfMonth = today.getDate();

    const relevantTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate <= today && transactionDate.getFullYear() >= (currentYear - 1);
    });

    const monthlySummary = {};

    relevantTransactions.forEach(t => {
      const transactionDate = new Date(t.date);
      const yearMonth = `${transactionDate.getFullYear()}-${(transactionDate.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!monthlySummary[yearMonth]) {
        monthlySummary[yearMonth] = { income: 0, expenses: 0, daysInMonth: 0 };
      }

      if (t.type === 'income') {
        monthlySummary[yearMonth].income += t.amount;
      } else {
        monthlySummary[yearMonth].expenses += t.amount;
      }
      monthlySummary[yearMonth].daysInMonth = new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 0).getDate();
    });

    let totalIncomeForAverage = 0;
    let totalExpensesForAverage = 0;
    let monthsIncludedInAverage = 0;

    // Uzimamo podatke za prosjek iz protekla 3 puna mjeseca
    for (let i = 1; i <= 3; i++) { // Počinjemo od prošlog mjeseca unazad 3 mjeseca
        const d = new Date(currentYear, currentMonth - i, 1);
        const yearMonth = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
        if (monthlySummary[yearMonth] && monthlySummary[yearMonth].daysInMonth === new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()) {
            totalIncomeForAverage += monthlySummary[yearMonth].income;
            totalExpensesForAverage += monthlySummary[yearMonth].expenses;
            monthsIncludedInAverage++;
        }
    }

    // Ako nema dovoljno punih mjeseci, uzmemo sve dostupne podatke
    if (monthsIncludedInAverage === 0 && Object.keys(monthlySummary).length > 0) {
        for (const ym in monthlySummary) {
            totalIncomeForAverage += monthlySummary[ym].income;
            totalExpensesForAverage += monthlySummary[ym].expenses;
            monthsIncludedInAverage++;
        }
    }

    const avgMonthlyNetBalance = monthsIncludedInAverage > 0 ? (totalIncomeForAverage - totalExpensesForAverage) / monthsIncludedInAverage : 0;

    // Izračun stvarnog balansa za tekući mjesec do danas
    const currentMonthKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
    const actualCurrentMonthIncome = monthlySummary[currentMonthKey]?.income || 0;
    const actualCurrentMonthExpenses = monthlySummary[currentMonthKey]?.expenses || 0;
    const actualCurrentMonthNetBalance = actualCurrentMonthIncome - actualCurrentMonthExpenses;

    // Projekcija za preostale dane tekućeg mjeseca ako postoji prosjek
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemainingInCurrentMonth = daysInCurrentMonth - currentDayOfMonth;

    let projectedCurrentMonthNetBalance = actualCurrentMonthNetBalance;
    if (monthsIncludedInAverage > 0) {
        // Ako imamo dovoljno podataka za prosjek, projiciramo preostali dio mjeseca
        const dailyAvgNetBalance = avgMonthlyNetBalance / daysInCurrentMonth;
        projectedCurrentMonthNetBalance += (dailyAvgNetBalance * daysRemainingInCurrentMonth);
    } else {
        // Ako nema prosjeka, koristimo samo do sada ostvareni balans za tekući mjesec
        projectedCurrentMonthNetBalance = actualCurrentMonthNetBalance;
    }


    const remainingFullMonthsInYear = 12 - (currentMonth + 1);
    let projectedAnnualBalance = projectedCurrentMonthNetBalance + (avgMonthlyNetBalance * remainingFullMonthsInYear);

    let message = "";
    if (projectedAnnualBalance < 0) {
        // Izračun godišnjeg deficita temeljenog na *planiranom mjesečnom manjku* ako je to prioritet
        const totalAllocatedExpenses = Object.keys(budget)
            .filter(cat => cat !== 'monthlyIncome')
            .reduce((sum, cat) => sum + budget[cat], 0);
        const monthlyBalance = budget.monthlyIncome - totalAllocatedExpenses;
        const projectedBudgetDeficit = monthlyBalance * 12;

        if (projectedBudgetDeficit < 0) {
            message = `Ako ne popravite svoje financije, ovu godinu ćete završiti u **minus**u od **${Math.abs(projectedBudgetDeficit).toFixed(2)}€** (temeljeno na vašem planiranom mjesečnom budžetu). Ovo je ozbiljno upozorenje i zahtijeva hitnu akciju za smanjenje potrošnje ili povećanje prihoda!`;
        } else {
            // Ako nema planiranog deficita, ali stvarni trend pokazuje deficit
            message = `Ako se trenutni trend nastavi, na kraju godine bit ćete u **deficisu** od **${Math.abs(projectedAnnualBalance).toFixed(2)}€**. Ovo je ozbiljno upozorenje i zahtijeva hitnu akciju za smanjenje potrošnje ili povećanje prihoda!`;
        }

    } else if (projectedAnnualBalance > 0) {
      message = `Odlično ste na putu! Ako se trenutni trend nastavi, do kraja godine mogli biste **uštedjeti** čak **${projectedAnnualBalance.toFixed(2)}€**. Nastavite s dobrim financijskim navikama!`;
    } else {
      message = "Vaše financije su na nuli. Nema očekivane uštede ni deficita do kraja godine pri ovom trendu.";
    }
    return message;
  };

  return (
    <div className="finance-planner content-section">
      <h2>Financijski Planer</h2>
      <p className="section-description">Upravljajte svojim financijama jednostavno i efikasno.</p>

      <div className="planner-tabs">
        <button onClick={() => setActiveTab('budget')} className={activeTab === 'budget' ? 'active' : ''}>Mjesečni Budžet</button>
        <button onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'active' : ''}>Transakcije</button>
        <button onClick={() => setActiveTab('goals')} className={activeTab === 'goals' ? 'active' : ''}>Ciljevi</button>
      </div>

      <div className="planner-content">
        {activeTab === 'budget' && (
          <div className="monthly-budget-section planner-card">
            <h3>Mjesečni Budžet</h3>

            <div className="budget-balance-summary">
              <p className={`balance-status ${calculateBudgetBalance() >= 0 ? 'positive' : 'negative'}`}>
                Trenutni saldo budžeta: <strong>{calculateBudgetBalance().toFixed(2)}€</strong>
              </p>
            </div>

            <div className="budget-inputs">
              <div className="budget-item income-item">
                <label htmlFor="monthlyIncome">
                  <i className={`fa-solid ${categoryIcons['monthlyIncome']} icon`}></i> Mjesečna primanja (€):
                </label>
                <input
                  type="number"
                  id="monthlyIncome"
                  value={budget.monthlyIncome}
                  onChange={(e) => handleBudgetChange('monthlyIncome', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {Object.keys(budget)
                .filter(category => category !== 'monthlyIncome')
                .map((category) => (
                <div className="budget-item" key={category}>
                  <label htmlFor={category}>
                    <i className={`fa-solid ${categoryIcons[category] || 'fa-tag'} icon`}></i> {capitalize(category)} (€):
                  </label>
                  <input
                    type="number"
                    id={category}
                    value={budget[category]}
                    onChange={(e) => handleBudgetChange(category, e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <div className="progress-bar-container">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${getProgressBarData().find(d => d.name.toLowerCase() === category)?.percentage || 0}%`,
                          backgroundColor: (getProgressBarData().find(d => d.name.toLowerCase() === category)?.percentage || 0) > 90 ? 'var(--attention-orange)' :
                                           (getProgressBarData().find(d => d.name.toLowerCase() === category)?.percentage || 0) > 70 ? 'var(--pending-orange)' : 'var(--approved-green)'
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {((getProgressBarData().find(d => d.name.toLowerCase() === category)?.percentage) || 0).toFixed(0)}%
                    </span>
                  </div>
                  <p className="spent-info">
                    Potrošeno: {(getProgressBarData().find(d => d.name.toLowerCase() === category)?.spent || 0).toFixed(2)}€ /
                    Preostalo: {((getBudgetDataForChart().find(d => d.name.toLowerCase() === category)?.allocated || 0) - (getProgressBarData().find(d => d.name.toLowerCase() === category)?.spent || 0)).toFixed(2)}€
                  </p>
                </div>
              ))}
            </div>

            <div className="add-category-section">
                <input
                    type="text"
                    placeholder="Naziv nove kategorije..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button className="secondary-button" onClick={addCustomCategory}>Dodaj kategoriju</button>
            </div>

            {budgetNotifications.length > 0 && (
              <div className="budget-notifications">
                <h4>Obavijesti:</h4>
                {budgetNotifications.map((notification, index) => (
                  <p key={index} className={`notification ${notification.type}`}>
                    {notification.message}
                  </p>
                ))}
              </div>
            )}

            <div className="budget-chart">
              <h4>Vizualni prikaz budžeta (Alocirani rashodi)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getBudgetDataForChart()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getBudgetDataForChart().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [`${value}€`, props.payload.name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="chart-note">Ovaj grafikon prikazuje alocirani budžet po kategorijama rashoda. Količina potrošenog unutar budžeta prikazana je progress barovima iznad.</p>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="transactions-section planner-card">
            <h3>Praćenje Prihoda i Rashoda</h3>

            <form onSubmit={addTransaction} className="transaction-form">
              <div className="form-group">
                <label htmlFor="amount">Iznos (€):</label>
                <input type="number" id="amount" name="amount" value={newTransaction.amount} onChange={handleTransactionChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="category">Kategorija:</label>
                <select id="category" name="category" value={newTransaction.category} onChange={handleTransactionChange} required>
                  <option value="">Odaberi kategoriju</option>
                  {getCategoriesForTransactions().map(cat => (
                    <option key={cat} value={cat}>{capitalize(cat)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="type">Tip:</label>
                <select id="type" name="type" value={newTransaction.type} onChange={handleTransactionChange}>
                  <option value="expense">Rashod</option>
                  <option value="income">Prihod</option>
                </select>
              </div>
              {newTransaction.type === 'expense' && (
                <div className="form-group">
                  <label htmlFor="subtype">Podtip:</label>
                  <select id="subtype" name="subtype" value={newTransaction.subtype} onChange={handleTransactionChange}>
                    <option value="variable">Varijabilni</option>
                    <option value="fixed">Fiksni</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label htmlFor="date">Datum:</label>
                <input type="date" id="date" name="date" value={newTransaction.date} onChange={handleTransactionChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="description">Opis (opcionalno):</label>
                <textarea id="description" name="description" value={newTransaction.description} onChange={handleTransactionChange} rows="2"></textarea>
              </div>
              <button type="submit" className="cta-button">Dodaj Transakciju</button>
            </form>

            <div className="transaction-filters">
              <h4>Filteri:</h4>
              <select value={filter.type} onChange={(e) => setFilter({ ...filter, type: e.target.value })}>
                <option value="all">Svi tipovi</option>
                <option value="income">Prihodi</option>
                <option value="expense">Rashodi</option>
              </select>
              <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
                <option value="all">Sve kategorije</option>
                {getCategoriesForTransactions().map(cat => (
                  <option key={cat} value={cat}>{capitalize(cat)}</option>
                ))}
              </select>
              <input type="date" value={filter.startDate} onChange={(e) => setFilter({ ...filter, startDate: e.target.value })} placeholder="Od datuma" />
              <input type="date" value={filter.endDate} onChange={(e) => setFilter({ ...filter, endDate: e.target.value })} placeholder="Do datuma" />
            </div>

            <div className="transactions-list">
              <h4>Transakcije:</h4>
              {filteredTransactions.length === 0 ? (
                <p className="no-data-message">Nema transakcija za prikaz.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Datum</th>
                      <th>Iznos</th>
                      <th>Kategorija</th>
                      <th>Tip</th>
                      <th>Podtip</th>
                      <th>Opis</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(t => (
                      <tr key={t.id} className={t.type === 'income' ? 'income-row' : 'expense-row'}>
                        <td>{t.date}</td>
                        <td>{t.amount.toFixed(2)}€</td>
                        <td>{capitalize(t.category)}</td>
                        <td>{t.type === 'income' ? 'Prihod' : 'Rashod'}</td>
                        <td>{t.subtype ? capitalize(t.subtype) : '-'}</td>
                        <td>{t.description || '-'}</td>
                        <td>
                          <button className="secondary-button small-button" onClick={() => deleteTransaction(t.id)}>Izbriši</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="transaction-charts">
              <h4>Rashodi po Kategorijama (trenutni mjesec)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getExpenseDataByCategories()}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getExpenseDataByCategories().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              <h4>Prihodi vs. Rashodi (Mjesečna Usporedba)</h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getMonthlyComparisonData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(204, 214, 246, 0.1)" />
                  <XAxis dataKey="name" stroke={PIE_COLORS[0]} tick={{ fill: 'var(--starlight)' }} />
                  <YAxis stroke={PIE_COLORS[0]} tick={{ fill: 'var(--starlight)' }} />
                  <Tooltip formatter={(value, name) => [`${value}€`, name]} />
                  <Legend />
                  <Bar dataKey="Prihodi" fill={PIE_COLORS[4]} />
                  <Bar dataKey="Rashodi" fill={PIE_COLORS[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="financial-goals-section planner-card">
            <h3>Financijski Ciljevi</h3>

            <form onSubmit={addGoal} className="goal-form">
              <div className="form-group">
                <label htmlFor="goalName">Naziv cilja:</label>
                <input type="text" id="goalName" name="name" value={newGoal.name} onChange={handleGoalChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="targetAmount">Ciljani iznos (€):</label>
                <input type="number" id="targetAmount" name="targetAmount" value={newGoal.targetAmount} onChange={handleGoalChange} required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="savedAmount">Trenutno ušteđeno (€):</label>
                <input type="number" id="savedAmount" name="savedAmount" value={newGoal.savedAmount} onChange={handleGoalChange} min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Rok (datum):</label>
                <input type="date" id="dueDate" name="dueDate" value={newGoal.dueDate} onChange={handleGoalChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="monthlyContribution">Preporučena mjesečna uplata (€):</label>
                <input type="number" id="monthlyContribution" name="monthlyContribution" value={newGoal.monthlyContribution} onChange={handleGoalChange} min="0" step="0.01" />
              </div>
              <button type="submit" className="cta-button">Dodaj Cilj</button>
            </form>

            <div className="goals-list">
              <h4>Moji Ciljevi:</h4>
              {goals.length === 0 ? (
                <p className="no-data-message">Nema postavljenih financijskih ciljeva.</p>
              ) : (
                goals.map(goal => {
                  const progress = (goal.savedAmount / goal.targetAmount) * 100;
                  const remaining = goal.targetAmount - goal.savedAmount;
                  const daysLeft = goal.dueDate ? Math.ceil((new Date(goal.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : 'N/A';

                  return (
                    <div key={goal.id} className="goal-item">
                      <p className="goal-name"><strong>{goal.name}</strong></p>
                      <p>Cilj: {goal.targetAmount.toFixed(2)}€</p>
                      <p>Ušteđeno: {goal.savedAmount.toFixed(2)}€</p>
                      <p>Rok: {goal.dueDate} ({daysLeft > 0 ? `${daysLeft} dana preostalo` : daysLeft === 0 ? 'Istječe danas' : 'Prošlo'})</p>
                      {goal.monthlyContribution > 0 && <p>Mjesečno: {goal.monthlyContribution.toFixed(2)}€</p>}
                      <div className="progress-bar-container large-bar">
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: progress >= 100 ? 'var(--approved-green)' : (progress > 70 ? 'var(--neon-blue)' : 'var(--pending-orange)')
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">{progress.toFixed(0)}%</span>
                      </div>
                      <p className="spent-info">Preostalo za uštedjeti: {remaining.toFixed(2)}€</p>
                      <button className="secondary-button small-button" onClick={() => {
                        const amountToAdd = parseFloat(prompt(`Unesite iznos za dodati u "${goal.name}":`));
                        if (!isNaN(amountToAdd) && amountToAdd > 0) {
                          updateGoalSavedAmount(goal.id, amountToAdd);
                        }
                      }}>Dodaj sredstva</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="ai-insights-section planner-card">
            <h3>Automatski Financijski Savjeti</h3>
            <div className="tips-list">
                {generateFinancialTips().map((tip, index) => (
                    <p key={index} className="tip-item" dangerouslySetInnerHTML={{ __html: tip }}></p>
                ))}
            </div>
            {getMonthlyDeficitMessage() && (
                <div className="monthly-deficit-insight">
                    <h4>{getMonthlyDeficitMessage()}</h4>
                    <p className="chart-note">Ovo je iznos vašeg planiranog mjesečnog manjka na temelju postavljenog budžeta. Kritično je poduzeti mjere!</p>
                </div>
            )}
        </div>

        <div className="annual-overview-section planner-card">
            <h3>Godišnji Financijski Pregled</h3>
            <p className="overview-text" dangerouslySetInnerHTML={{ __html: getAnnualOutlook() }}></p>
        </div>
      </div>
    </div>
  );
};

export default FinancePlanner;