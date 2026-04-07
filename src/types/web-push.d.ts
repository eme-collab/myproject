declare module 'web-push' {
  const webpush: {
    setVapidDetails(
      subject: string,
      publicKey: string,
      privateKey: string
    ): void
    sendNotification(
      subscription: {
        endpoint: string
        expirationTime?: number | null
        keys: {
          p256dh: string
          auth: string
        }
      },
      payload?: string
    ): Promise<void>
  }

  export default webpush
}
