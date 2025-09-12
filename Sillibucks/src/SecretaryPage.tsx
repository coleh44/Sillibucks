// filepath: [SecretaryPage.tsx]
import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";import { useEffect } from "react";

const YALIES_API = 'https://api.yalies.io/v2/people';
const API_KEY = import.meta.env.VITE_YALIES_API_KEY;

interface Person {
  first_name: string;
  last_name: string;
  netid: string;
  college?: string;
  year?: string;
}

const SecretaryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person[]>([]); // now array
  const [bucks, setBucks] = useState<{ [netid: string]: number }>({});
  const [inputValues, setInputValues] = useState<{ [netid: string]: string }>({});
  const [firebasePeople, setFirebasePeople] = useState<Person[]>([]);

  useEffect(() => {
    const fetchBucks = async () => {
      const bucksSnapshot = await getDocs(collection(db, "bucks"));
      const bucksData: { [netid: string]: number } = {};
      const peopleData: Person[] = [];
      bucksSnapshot.forEach(doc => {
        bucksData[doc.id] = doc.data().amount;
        // If you store more info in Firestore, use it here
        peopleData.push({
          first_name: doc.data().first_name || "",
          last_name: doc.data().last_name || "",
          netid: doc.id,
          college: doc.data().college,
          year: doc.data().year,
        });
      });
      setBucks(bucksData);
      setFirebasePeople(peopleData);
    };

    fetchBucks();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    const res = await fetch(YALIES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        query: search,
        filters: { college: "Silliman" },
        page: 0,
        page_size: 50,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Error: ${res.status} - ${text}`);
      return;
    }

    const data = await res.json();
    console.log("Query result:", data);
    setResults(data);
  };

  // toggle selection
  const handleSelect = (person: Person) => {
    setSelected(prev => {
      if (prev.find(p => p.netid === person.netid)) {
        // already selected → deselect
        return prev.filter(p => p.netid !== person.netid);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleInputChange = (netid: string, value: string) => {
      setInputValues(prev => ({
      ...prev,
      [netid]: value,
      }));
  };

  const handleApplyChange = async (netid: string) => {
    const value = parseFloat(inputValues[netid]);
    if (!isNaN(value)) {
      const newBucks = (bucks[netid] || 0) + value;
      setBucks(prev => ({ ...prev, [netid]: newBucks }));

      // Find the person object by netid
      const person =
        selected.find(p => p.netid === netid) ||
        firebasePeople.find(p => p.netid === netid);

      if (person) {
        await setDoc(doc(db, "bucks", netid), {
          amount: newBucks,
          first_name: person.first_name,
          last_name: person.last_name,
          college: person.college,
          year: person.year,
        });
      }

      setInputValues(prev => ({ ...prev, [netid]: '' }));
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Panel */}
      <div style={{
        width: 260,
        borderRight: '1px solid #eee',
        padding: '16px 12px',
        background: '#fafafa',
        height: '100vh',
        boxSizing: 'border-box'
      }}>
        <h3 style={{ marginTop: 0 }}>Previous Players</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {firebasePeople.map(person => (
            <li key={person.netid} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  {(person.first_name || person.last_name)
                    ? `${person.first_name} ${person.last_name}`
                    : person.netid}
                </span>
                <div>
                  {selected.some(p => p.netid === person.netid) ? (
                    <button
                      style={{
                        width: 70,
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#f87171',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelect(person)}
                    >
                      Deselect
                    </button>
                  ) : (
                    <button
                      style={{
                        width: 60,
                        marginLeft: 8,
                        marginRight: 3,
                        padding: '4px 8px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#10b981',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelect(person)}
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ 
        flex: 1,
        padding: '32px 24px',
        marginLeft: 0
        }}>
        <h1>
          <a
            href="#"
            style={{ color: '#10b981', textDecoration: 'none', cursor: 'pointer' }}
            onClick={e => {
              e.preventDefault();
              window.location.reload();
            }}
          >
            Sillibucks
          </a>
        </h1>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for a person..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '70%', padding: 8 }}
          />
          <button type="submit" style={{ padding: 8, marginLeft: 8 }}>Search</button>
        </form>

        <ul>
          {results.map(person => {
            const isSelected = selected.some(p => p.netid === person.netid);
            return (
              <li key={person.netid} style={{ margin: '8px 0' }}>
                <button
                  onClick={() => handleSelect(person)}
                  style={{
                    background: isSelected ? '#d1fae5' : '#f3f4f6',
                    border: isSelected ? '2px solid #10b981' : '1px solid #e5e7eb',
                    padding: '8px 12px',
                    borderRadius: 6,
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {person.first_name} {person.last_name} ({person.netid}) - {person.college ?? 'N/A'} '{person.year ?? 'N/A'}
                </button>
              </li>
            );
          })}
        </ul>

        {results.length === 0 && search.trim() && (
          <p style={{ marginTop: 12, fontStyle: 'italic', color: '#555' }}>
            No results found for "{search}"
          </p>
        )}

        {selected.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h2>Selected People</h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: 16 }}>
              <button
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={async () => {
                  for (const person of selected) {
                    const newBucks = (bucks[person.netid] || 0) + 1;
                    setBucks(prev => ({ ...prev, [person.netid]: newBucks }));
                    await setDoc(doc(db, "bucks", person.netid), { 
                      amount: newBucks,
                      first_name: person.first_name,
                      last_name: person.last_name,
                      year: person.year,
                    });
                  }
                }}
              >
                Add 1 Buck to All Selected
              </button>
              <button
                style={{
                  background: '#f87171',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={async () => {
                  for (const person of selected) {
                    const newBucks = (bucks[person.netid] || 0) - 1;
                    setBucks(prev => ({ ...prev, [person.netid]: newBucks }));
                    await setDoc(doc(db, "bucks", person.netid), {
                      amount: newBucks,
                      first_name: person.first_name,
                      last_name: person.last_name,
                      college: person.college,
                      year: person.year,
                    });
                  }
                }}
              >
                Subtract 1 Buck from All Selected
              </button>
            </div>
            {selected.map(person => (
              <div
                key={person.netid}
                style={{ marginTop: 16, border: '1px solid #ccc', padding: 16, borderRadius: 8 }}
              >
                  <button
                      style={{
                      background: '#f87171',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: 6,
                      cursor: 'pointer'
                      }}
                      onClick={() => handleSelect(person)}
                  >
                      Deselect
                  </button>
                <h3>{person.first_name} {person.last_name}</h3>
                <p>NetID: {person.netid}</p>
                <p>College: {person.college ?? 'N/A'}</p>
                <p>Year: {person.year ?? 'N/A'}</p>
                <p>
                  Buttery Bucks: <strong>{(bucks[person.netid] || 0).toFixed(2)}</strong>
                </p>
                <div style={{ marginTop: 8 }}>
                  <input
                      type="number"
                      step="0.25"
                      value={inputValues[person.netid] ?? ''}
                      onChange={(e) => handleInputChange(person.netid, e.target.value)}
                      placeholder="Enter amount (+/-)"
                      style={{ padding: 6, width: 120, marginRight: 8 }}
                  />
                  <button className="apply-btn" onClick={() => handleApplyChange(person.netid)}>
                      Apply
                  </button>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecretaryPage;
