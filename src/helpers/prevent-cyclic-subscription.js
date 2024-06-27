export default ((registry) =>
  function preventCyclicSubsription(subscriberID, subjectID) {
    const subscriberSubscriptions = registry.get(subscriberID) || new Set();
    const subjectSubscriptions = registry.get(subjectID) || new Set();

    if (subscriberID === subjectID) {
      throw new Error('Self subscription');
    }

    if (subjectSubscriptions.has(subscriberID)) {
      throw new Error('Cyclic subscription');
    }

    subscriberSubscriptions.add(subjectID);

    subjectSubscriptions.forEach((id) => {
      subscriberSubscriptions.add(id);
    });

    registry.set(subscriberID, subscriberSubscriptions);
  })(new Map());
