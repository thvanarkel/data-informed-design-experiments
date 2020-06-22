import React from 'react';
// import Spinner from './Spinner'; // not provided in this post
// import Error from './Error'; // not provided in this post

function useFetcher(action) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [data, setData] = React.useState(null);
  async function loadData() {
    try {
      setLoading(true);
      console.log("queryData");
      const actionData = await action();
      console.log(actionData);
      setData(actionData);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }
  React.useEffect(() => {
    loadData();
  }, [action]);
  return [data, loading, error];
}

const Fetcher = ({ action, children }) => {
  const [data, loading, error] = useFetcher(action);

  // if (loading) return <Spinner />;
  // if (error) return <Error error={error} />
  if (!data) return null;
  return children(data, loading);
};
export default Fetcher;
