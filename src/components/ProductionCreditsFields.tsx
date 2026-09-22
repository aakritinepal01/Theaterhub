"use client";

import { useRef, useState } from "react";
import styles from "./ProductionCreditsFields.module.css";

function PeopleField({ name, title, description, names }: {
  name: "onStage" | "offStage";
  title: string;
  description: string;
  names: string[];
}) {
  const nextId = useRef(names.length || 1);
  const [people, setPeople] = useState(() => (names.length ? names : [""]).map((value, id) => ({ id, value })));

  return (
    <fieldset className={styles.group}>
      <legend>{title}</legend>
      <p>{description}</p>
      <input type="hidden" name={name} value="" />
      <div className={styles.list}>
        {people.map((person, index) => (
          <div className={styles.row} key={person.id}>
            <label>
              <span>{title} name {index + 1}</span>
              <input name={name} value={person.value} placeholder="Full name" onChange={event => setPeople(current => current.map(item => item.id === person.id ? { ...item, value: event.target.value } : item))} />
            </label>
            <button type="button" aria-label={`Remove ${title.toLowerCase()} name ${index + 1}`} onClick={() => setPeople(current => current.filter(item => item.id !== person.id))}>Remove</button>
          </div>
        ))}
      </div>
      <button className={styles.add} type="button" onClick={() => setPeople(current => [...current, { id: nextId.current++, value: "" }])}>+ Add name</button>
    </fieldset>
  );
}

export function ProductionCreditsFields({ onStage = [], offStage = [] }: { onStage?: string[]; offStage?: string[] }) {
  return (
    <section className={styles.credits} aria-label="Cast and crew">
      <div className={styles.heading}><h3>Cast &amp; crew</h3><p>Credit the people who bring your production to life.</p></div>
      <PeopleField name="onStage" title="On-stage" description="Actors and performers appearing on stage." names={onStage} />
      <PeopleField name="offStage" title="Off-stage" description="The creative and technical team behind the scenes." names={offStage} />
    </section>
  );
}
