export const Resume = () => null;

export async function getServerSideProps() {
  return {
    redirect: {
      destination:
        'https://docs.google.com/document/d/1tyEiIj4fzgTCzvps4Nx7cHHOLDkQuhaQ/edit?usp=sharing&ouid=108184636657554124114&rtpof=true&sd=true',
      permanent: false,
    },
  };
}
