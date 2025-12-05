import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);
  return (
    <button className="counter" type="button" onClick={() => setCount((count) => count + 1)}>
      count is {count}
    </button>
  );
};
