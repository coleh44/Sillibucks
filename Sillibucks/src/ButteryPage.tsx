import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

interface Person {
  first_name: string;
  last_name: string;
  netid: string;
  college?: string;
  year?: string;
  amount?: number;
}

const ButteryPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [inputValues, setInputValues] = useState<{ [netid: string]: string }>({});

  useEffect(() => {
    const fetchPeople = async () => {
      const snapshot = await getDocs(collection(db, "bucks"));
      const data: Person[] = [];
      snapshot.forEach(docSnap => {
        data.push({
          first_name: docSnap.data().first_name || "",
          last_name: docSnap.data().last_name || "",
          netid: docSnap.id,
          college: docSnap.data().college,
          year: docSnap.data().year,
          amount: docSnap.data().amount,
        });
      });
      setPeople(data);
    };
    fetchPeople();
  }, []);

  // Filter people by search (case-insensitive, matches first or last name or netid)
  const filtered = search.trim()
    ? people.filter(person =>
        `${person.first_name} ${person.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        person.netid.toLowerCase().includes(search.toLowerCase())
      )
    : people;

  const handleInputChange = (netid: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [netid]: value,
    }));
  };

    const handleApplyChange = async (person: Person) => {
    const value = parseFloat(inputValues[person.netid]);
    if (!isNaN(value)) {
        const newAmount = (person.amount ?? 0) + value;
        // Update Firestore
        await setDoc(doc(db, "bucks", person.netid), {
        amount: newAmount,
        first_name: person.first_name,
        last_name: person.last_name,
        college: person.college ?? null, // <-- fix here
        year: person.year ?? null,       // <-- and here
        });
        // Update local state
        setPeople(prev =>
        prev.map(p =>
            p.netid === person.netid ? { ...p, amount: newAmount } : p
        )
        );
        setInputValues(prev => ({ ...prev, [person.netid]: '' }));
    }
    };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
      <h1 style={{ color: '#10b981', marginBottom: 24 }}>
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
      <input
        type="text"
        placeholder="Search by name or NetID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: 10, fontSize: 18, marginBottom: 24, borderRadius: 6, border: '1px solid #ccc' }}
      />
      {filtered.length === 0 ? (
        <p style={{ fontStyle: 'italic', color: '#555' }}>No matching people found.</p>
      ) : (
        <div>
          {filtered.map(person => (
            <div
              key={person.netid}
              style={{
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 18,
                marginBottom: 18,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              <h2 style={{ margin: 0, color: '#065f46' }}>
                {person.first_name} {person.last_name}
              </h2>
              <p style={{ margin: '8px 0 0 0' }}>
                <strong>NetID:</strong> {person.netid}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>College:</strong> {person.college ?? 'N/A'}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Year:</strong> {person.year ?? 'N/A'}
              </p>
              <p style={{ margin: '4px 0' }}>
                <strong>Buttery Bucks:</strong> {person.amount ?? 0}
              </p>
              <div style={{ marginTop: 10 }}>
                <input
                  type="number"
                  step="0.25"
                  value={inputValues[person.netid] ?? ''}
                  onChange={e => handleInputChange(person.netid, e.target.value)}
                  placeholder="Enter amount (+/-)"
                  style={{ padding: 6, width: 120, marginRight: 8, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button
                  onClick={() => handleApplyChange(person)}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: 6,
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ButteryPage;