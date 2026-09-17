import CollaborativeEditor from "../features/editor/CollaborativeEditor";

export default function CollaborationTestPage() {
    return (
        <main>
            <h1>Collaboration test</h1>
            <p>Open this page in two browser sessions.</p>

            <CollaborativeEditor roomName="collab-test-room" />
        </main>
    );
}