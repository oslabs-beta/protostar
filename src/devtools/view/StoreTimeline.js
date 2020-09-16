import React, { useState, useEffect, useContext, useCallback } from "react";
import InputRange from 'react-input-range';
import { BridgeContext, StoreContext } from '../context';
import StoreDisplayer from "./StoreDisplayer";
// import { detailedDiff } from 'deep-object-diff';


const StoreTimeline = ({ currentEnvID }) => {
  const store = useContext(StoreContext);
  const bridge = useContext(BridgeContext);
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [timelineLabel, setTimelineLabel] = useState('');
  const [liveStore, setLiveStore] = useState(store.getRecords(currentEnvID));
  const [timeline, setTimeline] = useState({
    [currentEnvID]: [{
      label: "current",
      date: Date.now(),
      storage: liveStore,
    }]
  });

  const handleClick = (e) => {
    console.log('BAAAAAAAA!!!!')
    e.preventDefault();
    const timelineInsert = {};
    const timeStamp = Date.now();
    timelineInsert.label = timelineLabel;
    timelineInsert.date = timeStamp;
    timelineInsert.storage = liveStore;
    const newTimeline = [timelineInsert].concat(timeline[currentEnvID])
    setTimeline({ ...timeline, [currentEnvID]: newTimeline });
    e.target.value = "";
  }

  const updateStoreHelper = (storeObj) => {
    setLiveStore(storeObj);
  }

  useEffect(() => {
    const refreshLiveStore = () => {
      bridge.send('refreshStore', currentEnvID);
      setTimeout(() => {
        const allRecords = store.getRecords(currentEnvID);
        console.log('REFRESH INVOKED! currentEnvID:', currentEnvID)
        updateStoreHelper(allRecords);
      }, 400)
    };
    store.addListener('mutationComplete', refreshLiveStore);
    return () => {
      store.removeListener('mutationComplete', refreshLiveStore);
    };
  }, [store]);

  useEffect(() => {
    console.log("AAAAAAAAAAAAAAAAAAAHHHHHHHHHHHHHHHHH")
    setLiveStore(store.getRecords(currentEnvID));

    if (!timeline[currentEnvID]) {
      const newTimeline = {
        ...timeline, [currentEnvID]: [{
          label: "current",
          date: Date.now(),
          storage: liveStore,
        }]
      }
      setTimeline(newTimeline);
    }

  }, [currentEnvID]);

  console.log('currenttimeilne', timeline)

  return (
    <React.Fragment>
      <div className="column">
        <div className="display-box">
          <div className="snapshot-wrapper is-flex">
            <input type="text" className="input is-small snapshot-btn is-primary" value={timelineLabel} onChange={(e) => setTimelineLabel(e.target.value)} placeholder="take a store snapshot"></input>
            <button className="button is-small is-link" onClick={(e) => handleClick(e)}>Snapshot</button>
          </div>
        </div>
        <div className="snapshots">
          <h2 className="slider-textcolor">Store Timeline</h2>
          <InputRange
            maxValue={timeline[currentEnvID] ? timeline[currentEnvID].length - 1 : 0}
            minValue={0}
            value={snapshotIndex}
            onChange={value => setSnapshotIndex(value)} />
          <div className="snapshot-nav">
            <button class="button is-small" onClick={() => { if (snapshotIndex !== 0) setSnapshotIndex(snapshotIndex - 1) }}>Backward</button>
            <button class="button is-small" onClick={() => setSnapshotIndex(0)}>Current</button>
            <button class="button is-small" onClick={() => { if (snapshotIndex !== timeline[currentEnvID].length - 1) setSnapshotIndex(snapshotIndex + 1) }}>Forward</button>
          </div>
        </div>
      </div>
      <StoreDisplayer store={snapshotIndex === 0 ? liveStore : timeline[currentEnvID][snapshotIndex].storage} />
    </React.Fragment>
  )
}

export default StoreTimeline;