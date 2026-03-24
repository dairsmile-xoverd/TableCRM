export default function getLinkWithToken(pathname: string) {
  return {
    pathname,
    query: { token: process.env.NEXT_PUBLIC_API_TOKEN },
  }
}
